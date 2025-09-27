"use client"

const InventoryPage = () => {
  // Mock data for user's inventory items
  const inventoryItems = [
    {
      id: 1,
      name: "Exclusive Avatar",
      description: "A unique avatar only available to premium members.",
      type: "Avatar",
    },
    {
      id: 2,
      name: "Animated Background",
      description: "A cool animated background for your profile.",
      type: "Background",
    },
    {
      id: 3,
      name: "VIP Badge",
      description: "A badge to show off your VIP status.",
      type: "Badge",
    },
  ]

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">Inventory</h1>
      <p className="mb-4">Here are the items in your inventory.</p>

      {inventoryItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {inventoryItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-xl font-semibold mb-2">{item.name}</h2>
              <p className="text-gray-600 mb-2">{item.description}</p>
              <p className="text-gray-500 text-sm">Type: {item.type}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No items in your inventory yet. Start earning or purchasing items to add to your collection!</p>
      )}
    </div>
  )
}

export default InventoryPage
