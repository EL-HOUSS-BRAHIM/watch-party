<?php
/**
 * API smoke test runner.
 *
 * Usage:
 *   php api_smoke_test.php --base-url="http://localhost:8000" [--token="JWT ..."] [--log="logs/api_smoke_test.log"] [--category="Authentication"]
 */

$shortOpts = "";
$longOpts = [
    "base-url:",
    "token::",
    "log::",
    "category::"
];

$options = getopt($shortOpts, $longOpts);

if (!isset($options['base-url'])) {
    fwrite(STDERR, "Missing required --base-url option\n");
    exit(1);
}

$baseUrl = rtrim($options['base-url'], "/");
$token = isset($options['token']) ? trim($options['token']) : null;
$logFile = isset($options['log']) ? $options['log'] : 'logs/api_smoke_test.log';
$categoryFilter = isset($options['category']) ? $options['category'] : null;

$jsonPath = __DIR__ . '/../../docs/api/backend-endpoints.json';
if (!file_exists($jsonPath)) {
    fwrite(STDERR, "Unable to locate backend-endpoints.json at {$jsonPath}\n");
    exit(1);
}

$payload = json_decode(file_get_contents($jsonPath), true);
if ($payload === null) {
    fwrite(STDERR, "Failed to decode backend-endpoints.json\n");
    exit(1);
}

$metadata = $payload['metadata'] ?? [];
$categories = $payload['categories'] ?? [];

if (!is_dir(dirname($logFile))) {
    mkdir(dirname($logFile), 0775, true);
}

$logHandle = fopen($logFile, 'a');
if (!$logHandle) {
    fwrite(STDERR, "Failed to open log file {$logFile}\n");
    exit(1);
}

$summary = [
    'tested' => 0,
    'skipped' => 0,
    'failures' => 0,
    'successes' => 0
];

$timestamp = date('c');
fwrite($logHandle, "===== API smoke test started at {$timestamp} =====\n");

foreach ($categories as $category) {
    $categoryName = $category['name'] ?? 'Unknown';
    if ($categoryFilter && strcasecmp($categoryFilter, $categoryName) !== 0) {
        continue;
    }

    foreach ($category['endpoints'] as $endpoint) {
        $endpointName = $endpoint['name'] ?? 'Unnamed endpoint';
        $path = $endpoint['path'] ?? null;
        if (!$path) {
            $summary['skipped']++;
            fwrite($logHandle, "[SKIP] {$categoryName} :: {$endpointName} - missing path\n");
            continue;
        }

        if (strpos($path, '<') !== false) {
            $summary['skipped']++;
            fwrite($logHandle, "[SKIP] {$categoryName} :: {$endpointName} {$path} - path parameters not resolved\n");
            continue;
        }

        foreach ($endpoint['operations'] as $operation) {
            $method = $operation['method'] ?? 'GET';
            $requiresAuth = $operation['auth_required'] ?? false;
            $notes = $operation['notes'] ?? '';
            $requestExample = $operation['request_example'] ?? null;
            $queryParameters = $operation['query_parameters'] ?? [];

            if ($requiresAuth && !$token) {
                $summary['skipped']++;
                fwrite($logHandle, "[SKIP] {$categoryName} :: {$endpointName} {$method} {$path} - authentication required\n");
                continue;
            }

            if (!empty($queryParameters)) {
                $summary['skipped']++;
                fwrite($logHandle, "[SKIP] {$categoryName} :: {$endpointName} {$method} {$path} - query parameters unsupported in automation\n");
                continue;
            }

            if (is_string($requestExample) && $method !== 'GET') {
                // unclear payload, skip to avoid malformed request
                $summary['skipped']++;
                fwrite($logHandle, "[SKIP] {$categoryName} :: {$endpointName} {$method} {$path} - ambiguous request body\n");
                continue;
            }

            $url = $baseUrl . $path;
            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false);
            curl_setopt($ch, CURLOPT_HEADER, true);

            $headers = [
                'User-Agent: WatchPartySmokeTest/1.0',
                'Accept: application/json'
            ];

            if ($requiresAuth && $token) {
                $headers[] = 'Authorization: ' . $token;
            }

            $body = null;
            if (in_array($method, ['POST', 'PUT', 'PATCH', 'DELETE'], true) && is_array($requestExample)) {
                $body = json_encode($requestExample);
                $headers[] = 'Content-Type: application/json';
                curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
            }

            curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

            $start = microtime(true);
            $response = curl_exec($ch);
            $end = microtime(true);
            $curlError = curl_error($ch);
            $statusCode = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
            $totalTime = curl_getinfo($ch, CURLINFO_TOTAL_TIME);
            $headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
            $responseBody = $response !== false ? substr($response, $headerSize) : null;
            curl_close($ch);

            $summary['tested']++;
            $resultType = 'FAIL';
            $detail = [
                'category' => $categoryName,
                'endpoint' => $endpointName,
                'method' => $method,
                'url' => $url,
                'status_code' => $statusCode,
                'duration' => $totalTime ?: ($end - $start),
                'notes' => $notes,
                'request_body' => $body,
                'requires_auth' => $requiresAuth
            ];

            if ($curlError) {
                $detail['error'] = $curlError;
                $summary['failures']++;
                fwrite($logHandle, "[FAIL] {$categoryName} :: {$endpointName} {$method} {$path} - CURL error: {$curlError}\n");
            } elseif ($statusCode >= 200 && $statusCode < 400) {
                $resultType = 'PASS';
                $summary['successes']++;
                fwrite($logHandle, sprintf("[PASS] %s :: %s %s %s - %d in %.3fs\n", $categoryName, $endpointName, $method, $path, $statusCode, $detail['duration']));
            } else {
                $detail['response_body'] = $responseBody;
                $summary['failures']++;
                fwrite($logHandle, sprintf("[FAIL] %s :: %s %s %s - HTTP %d\n", $categoryName, $endpointName, $method, $path, $statusCode));
            }
        }
    }
}

$timestamp = date('c');
fwrite($logHandle, "===== API smoke test completed at {$timestamp} =====\n");
fclose($logHandle);

printf("Tested: %d\n", $summary['tested']);
printf("Skipped: %d\n", $summary['skipped']);
printf("Successes: %d\n", $summary['successes']);
printf("Failures: %d\n", $summary['failures']);

echo "Detailed log written to {$logFile}\n";
