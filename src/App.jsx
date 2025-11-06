import { useEffect, useState } from "react";
import "./App.css";

const debounce = (fn, delay = 200) => {
  let timeoutId;
  return function (...args) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
};

function App() {
  const [pincode, setPincode] = useState("");
  const [data, setData] = useState(null);
  const [postOffice, setPostOffice] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function searchPostOffice() {
    if (pincode.length < 6) {
      alert("code must be 6 digit long");
      return;
    }
    setLoading(true);
    fetch(`https://api.postalpincode.in/pincode/${pincode}`)
      .then((res) => res.json())
      .then((postData) => {
        if(postData[0].Status === "404" || postData[0].Status === "Error"){
          setMessage(postData[0].Message);
          setData(null);
          setPostOffice([]);
        }else {
          setMessage("");
          setData(postData[0]);
          setPostOffice(postData[0].PostOffice || []);
        }
      })
      .catch((err) => {
        setMessage(err.message);
        setData(null);
        setPostOffice([]);
      })
      .finally(() => setLoading(false));
  }

  function handleFilter(query) {
    query = query.trim().toLowerCase();
    if(!query){
      setPostOffice(data?.PostOffice);
      return;
    }

    const filterPostOffice = data?.PostOffice.filter(
      (post) => post.Name.toLowerCase().includes(query)
    );

    if (filterPostOffice.length === 0) {
      setMessage("Couldn’t find the postal data you’re looking for…");
    } else {
      setMessage("");
    }

    setPostOffice(filterPostOffice);
  }
  const debounceSearch = debounce(handleFilter) 
  
  return (
    <main>
      {!data? (
        <div>
          <p className="bold">Enter Pincode</p>
            <input
              onChange={(e) => setPincode(e.target.value)}
              value={pincode}
              type="text"
              placeholder="Pincode"
            />
          <button className="lookup-btn" onClick={searchPostOffice}>
            {loading ? <span className="spin">&#9692;</span> : ""} Lookup
          </button>
          { message && <p className="error">{message}</p> }
        </div>
      ) : (
        <>
          <p className="bold">Pincode: {pincode}</p>
          <p>
            <span className="bold">Message:</span> {data?.Message}
          </p>

          <div className="search">
            <input
              type="search"
              onChange={(e) => debounceSearch(e.target.value)}
              placeholder="search"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
          </div>

          <section className="post_container">
            {postOffice.map((post,i) => (
              <div key={`${post.Name}-${i}`} className="post">
                <p>Name : {post.Name}</p>
                <p>Branch Type : {post.BranchType}</p>
                <p>Delivery Status : {post.DeliveryStatus}</p>
                <p>District : {post.District}</p>
                <p>Division : {post.Division}</p>
              </div>
            ))}
          </section>
          {message && <p>{message}</p>}
        </>
      )}
    </main>
  );
}

export default App;
