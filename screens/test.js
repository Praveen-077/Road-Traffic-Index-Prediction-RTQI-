const fun = async () => {
  const response = await fetch("http://192.168.216.77:5000/coordinates", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",  // Set the Content-Type to JSON
    },
    body: JSON.stringify({  // Stringify the body
      source: {"latitude": 16.29533, "longitude": 80.44265},
      destination: [10, 13],
    }),
  });

  const data = await response.json()

  console.log(data)
};

fun()
