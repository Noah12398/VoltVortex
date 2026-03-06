import { useEffect, useState } from "react";
import axios from "axios";

function App() {

  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:5000/soil")
      .then(res => setData(res.data))
  }, []);

  return (
    <div>
      <h1>Krishi-Net Dashboard</h1>

      {data && (
        <div>
          <p>Soil pH: {data.ph}</p>
          <p>Recommendation: {data.recommendation}</p>
        </div>
      )}

    </div>
  );
}

export default App;