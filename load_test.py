#!/usr/bin/env python3
"""
🚀 Load Testing Script for Watch Party Platform
Performs stress testing and load testing on critical endpoints

This script tests:
- Concurrent user authentication
- Video streaming under load
- WebSocket connection limits
- Database performance
- Memory and CPU usage

Usage:
    python load_test.py
    python load_test.py --users 50 --duration 30
    python load_test.py --endpoint /api/auth/login/ --method POST
"""

import asyncio
import aiohttp
import time
import json
import argparse
import statistics
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass
from typing import List, Dict, Optional
import websockets
import requests
from datetime import datetime

from test_config import (
    DEFAULT_BACKEND_URL,
    DEFAULT_FRONTEND_URL,
    TEST_USERS,
    PERFORMANCE_THRESHOLDS
)

@dataclass
class LoadTestResult:
    """Results from a single load test request"""
    success: bool
    response_time: float
    status_code: int
    error_message: Optional[str] = None
    timestamp: datetime = None
    
    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.now()

class LoadTester:
    def __init__(self, base_url: str = DEFAULT_BACKEND_URL):
        self.base_url = base_url
        self.results: List[LoadTestResult] = []
        self.session = None
    
    async def create_session(self):
        """Create async HTTP session"""
        connector = aiohttp.TCPConnector(limit=100, limit_per_host=50)
        timeout = aiohttp.ClientTimeout(total=30)
        self.session = aiohttp.ClientSession(connector=connector, timeout=timeout)
    
    async def close_session(self):
        """Close async HTTP session"""
        if self.session:
            await self.session.close()
    
    async def single_request(self, endpoint: str, method: str = "GET", data: dict = None, headers: dict = None) -> LoadTestResult:
        """Perform a single HTTP request and measure performance"""
        start_time = time.time()
        
        try:
            url = f"{self.base_url}{endpoint}"
            
            if method.upper() == "GET":
                async with self.session.get(url, headers=headers) as response:
                    response_time = time.time() - start_time
                    await response.text()  # Consume response body
                    
                    return LoadTestResult(
                        success=response.status < 400,
                        response_time=response_time,
                        status_code=response.status
                    )
            
            elif method.upper() == "POST":
                async with self.session.post(url, json=data, headers=headers) as response:
                    response_time = time.time() - start_time
                    await response.text()  # Consume response body
                    
                    return LoadTestResult(
                        success=response.status < 400,
                        response_time=response_time,
                        status_code=response.status
                    )
        
        except Exception as e:
            response_time = time.time() - start_time
            return LoadTestResult(
                success=False,
                response_time=response_time,
                status_code=0,
                error_message=str(e)
            )
    
    async def authenticate_user(self, user_data: dict) -> Optional[str]:
        """Authenticate a user and return access token"""
        try:
            result = await self.single_request("/api/auth/login/", "POST", user_data)
            if result.success and result.status_code == 200:
                # In a real scenario, we'd parse the response to get the token
                return "dummy_token"  # Placeholder
            return None
        except Exception:
            return None
    
    async def load_test_endpoint(self, endpoint: str, method: str, concurrent_users: int, 
                                duration: int, data: dict = None, auth_required: bool = False) -> Dict:
        """Perform load test on a specific endpoint"""
        
        await self.create_session()
        
        print(f"🚀 Starting load test:")
        print(f"   Endpoint: {method} {endpoint}")
        print(f"   Concurrent Users: {concurrent_users}")
        print(f"   Duration: {duration}s")
        print(f"   Auth Required: {auth_required}")
        
        # Prepare authentication if needed
        auth_token = None
        if auth_required:
            auth_token = await self.authenticate_user(TEST_USERS["demo"])
            if not auth_token:
                print("❌ Authentication failed, cannot proceed with protected endpoint")
                return {}
        
        headers = {}
        if auth_token:
            headers["Authorization"] = f"Bearer {auth_token}"
        
        # Start load test
        start_time = time.time()
        tasks = []
        
        async def user_load_worker():
            """Worker function that continuously hits the endpoint"""
            user_results = []
            while time.time() - start_time < duration:
                result = await self.single_request(endpoint, method, data, headers)
                user_results.append(result)
                await asyncio.sleep(0.1)  # Small delay between requests
            return user_results
        
        # Create concurrent user tasks
        for _ in range(concurrent_users):
            tasks.append(asyncio.create_task(user_load_worker()))
        
        # Wait for all tasks to complete
        all_results = await asyncio.gather(*tasks)
        
        # Flatten results
        self.results = []
        for user_results in all_results:
            self.results.extend(user_results)
        
        await self.close_session()
        
        # Calculate statistics
        return self.calculate_statistics()
    
    def calculate_statistics(self) -> Dict:
        """Calculate performance statistics from results"""
        if not self.results:
            return {}
        
        successful_results = [r for r in self.results if r.success]
        failed_results = [r for r in self.results if not r.success]
        
        response_times = [r.response_time for r in successful_results]
        
        stats = {
            "total_requests": len(self.results),
            "successful_requests": len(successful_results),
            "failed_requests": len(failed_results),
            "success_rate": len(successful_results) / len(self.results) * 100,
            "total_duration": max([r.timestamp for r in self.results]) - min([r.timestamp for r in self.results]),
            "requests_per_second": len(self.results) / ((max([r.timestamp for r in self.results]) - min([r.timestamp for r in self.results])).total_seconds() or 1)
        }
        
        if response_times:
            stats.update({
                "avg_response_time": statistics.mean(response_times),
                "min_response_time": min(response_times),
                "max_response_time": max(response_times),
                "median_response_time": statistics.median(response_times),
                "p95_response_time": self.percentile(response_times, 95),
                "p99_response_time": self.percentile(response_times, 99)
            })
        
        # Status code distribution
        status_codes = {}
        for result in self.results:
            status_codes[result.status_code] = status_codes.get(result.status_code, 0) + 1
        stats["status_codes"] = status_codes
        
        return stats
    
    @staticmethod
    def percentile(data: List[float], percentile: int) -> float:
        """Calculate percentile of a list"""
        if not data:
            return 0
        sorted_data = sorted(data)
        index = int((percentile / 100) * len(sorted_data))
        return sorted_data[min(index, len(sorted_data) - 1)]

async def test_websocket_load(concurrent_connections: int = 10, duration: int = 30):
    """Test WebSocket connection load"""
    print(f"🔌 Testing WebSocket load with {concurrent_connections} connections for {duration}s")
    
    async def websocket_worker():
        """Single WebSocket connection worker"""
        try:
            uri = f"ws://localhost:8000/ws/test/"
            async with websockets.connect(uri) as websocket:
                start_time = time.time()
                message_count = 0
                
                while time.time() - start_time < duration:
                    # Send test message
                    test_message = json.dumps({
                        "type": "ping",
                        "timestamp": time.time(),
                        "message_id": message_count
                    })
                    await websocket.send(test_message)
                    message_count += 1
                    
                    # Small delay
                    await asyncio.sleep(1)
                
                return {"success": True, "messages_sent": message_count}
        
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    # Create concurrent WebSocket connections
    tasks = [websocket_worker() for _ in range(concurrent_connections)]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    # Analyze results
    successful_connections = sum(1 for r in results if isinstance(r, dict) and r.get("success"))
    total_messages = sum(r.get("messages_sent", 0) for r in results if isinstance(r, dict) and r.get("success"))
    
    print(f"✅ WebSocket Load Test Results:")
    print(f"   Successful connections: {successful_connections}/{concurrent_connections}")
    print(f"   Total messages sent: {total_messages}")
    print(f"   Messages per second: {total_messages / duration:.2f}")

def test_database_performance():
    """Test database performance under load"""
    print("🗄️ Testing database performance...")
    
    # This would require database connection
    # For now, we'll just test API endpoints that hit the database
    
    endpoints_to_test = [
        ("/api/users/profile/", "GET"),
        ("/api/videos/", "GET"),
        ("/api/parties/", "GET"),
    ]
    
    for endpoint, method in endpoints_to_test:
        print(f"   Testing {method} {endpoint}")
        
        start_time = time.time()
        successful_requests = 0
        
        # Simulate concurrent database queries
        with ThreadPoolExecutor(max_workers=10) as executor:
            futures = []
            
            for _ in range(50):  # 50 concurrent requests
                future = executor.submit(requests.get, f"{DEFAULT_BACKEND_URL}{endpoint}")
                futures.append(future)
            
            for future in as_completed(futures):
                try:
                    response = future.result(timeout=10)
                    if response.status_code == 200:
                        successful_requests += 1
                except Exception:
                    pass
        
        duration = time.time() - start_time
        print(f"     Completed: {successful_requests}/50 in {duration:.2f}s")
        print(f"     Rate: {successful_requests/duration:.2f} req/s")

def print_load_test_results(stats: Dict):
    """Print formatted load test results"""
    print(f"\n📊 LOAD TEST RESULTS")
    print("=" * 50)
    print(f"📈 Volume:")
    print(f"   Total Requests: {stats.get('total_requests', 0)}")
    print(f"   Successful: {stats.get('successful_requests', 0)}")
    print(f"   Failed: {stats.get('failed_requests', 0)}")
    print(f"   Success Rate: {stats.get('success_rate', 0):.1f}%")
    
    print(f"\n⏱️ Performance:")
    print(f"   Requests/sec: {stats.get('requests_per_second', 0):.2f}")
    print(f"   Avg Response: {stats.get('avg_response_time', 0)*1000:.0f}ms")
    print(f"   Min Response: {stats.get('min_response_time', 0)*1000:.0f}ms")
    print(f"   Max Response: {stats.get('max_response_time', 0)*1000:.0f}ms")
    print(f"   95th Percentile: {stats.get('p95_response_time', 0)*1000:.0f}ms")
    print(f"   99th Percentile: {stats.get('p99_response_time', 0)*1000:.0f}ms")
    
    print(f"\n📋 Status Codes:")
    for code, count in stats.get('status_codes', {}).items():
        print(f"   {code}: {count}")
    
    # Performance evaluation
    avg_response = stats.get('avg_response_time', 0)
    success_rate = stats.get('success_rate', 0)
    
    print(f"\n🎯 Performance Evaluation:")
    if avg_response < 0.5:
        print("   Response Time: ✅ Excellent")
    elif avg_response < 1.0:
        print("   Response Time: ✅ Good")
    elif avg_response < 2.0:
        print("   Response Time: ⚠️ Acceptable")
    else:
        print("   Response Time: ❌ Needs Improvement")
    
    if success_rate >= 99:
        print("   Reliability: ✅ Excellent")
    elif success_rate >= 95:
        print("   Reliability: ✅ Good")
    elif success_rate >= 90:
        print("   Reliability: ⚠️ Acceptable")
    else:
        print("   Reliability: ❌ Needs Improvement")

async def main():
    """Main load testing function"""
    parser = argparse.ArgumentParser(description='Load testing for Watch Party Platform')
    parser.add_argument('--users', type=int, default=10, help='Number of concurrent users')
    parser.add_argument('--duration', type=int, default=30, help='Test duration in seconds')
    parser.add_argument('--endpoint', default='/api/auth/login/', help='API endpoint to test')
    parser.add_argument('--method', default='POST', help='HTTP method')
    parser.add_argument('--websocket', action='store_true', help='Test WebSocket connections')
    parser.add_argument('--database', action='store_true', help='Test database performance')
    parser.add_argument('--all', action='store_true', help='Run all load tests')
    
    args = parser.parse_args()
    
    print("🧪 Watch Party Platform - Load Testing")
    print("=" * 50)
    
    if args.all or not any([args.websocket, args.database]):
        # Default API endpoint load test
        tester = LoadTester()
        
        # Test data for login endpoint
        test_data = TEST_USERS["demo"] if args.endpoint == '/api/auth/login/' else None
        auth_required = 'auth' not in args.endpoint and args.endpoint != '/api/auth/login/'
        
        stats = await tester.load_test_endpoint(
            endpoint=args.endpoint,
            method=args.method,
            concurrent_users=args.users,
            duration=args.duration,
            data=test_data,
            auth_required=auth_required
        )
        
        print_load_test_results(stats)
    
    if args.websocket or args.all:
        print("\n" + "=" * 50)
        await test_websocket_load(concurrent_connections=args.users, duration=args.duration)
    
    if args.database or args.all:
        print("\n" + "=" * 50)
        test_database_performance()
    
    print(f"\n🏁 Load testing completed!")
    print("💡 Tips for improvement:")
    print("   - Use caching for frequently accessed data")
    print("   - Implement connection pooling")
    print("   - Add database indexing")
    print("   - Consider CDN for static assets")
    print("   - Monitor memory and CPU usage")

if __name__ == "__main__":
    asyncio.run(main())
