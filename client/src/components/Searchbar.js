import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "./Searchbar.css"
export default function SearchBar()
{
  var picLink = "https://cdn-icons-png.flaticon.com/128/3177/3177440.png";
  const [inputValue, setInputValue] = useState('');
  const [users, setUsers] = useState([]);
  const navigate = useNavigate(); 

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`http://localhost:5000/users`, {
          method: "post",
          headers: {
            Authorization: "Bearer " + localStorage.getItem("jwt"),
            "Content-Type": 'application/json',
          },
          body: JSON.stringify({ sub: inputValue }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    // Fetch users only if there is an inputValue
    if (inputValue.trim() !== '') {
      fetchUsers();
    } else {
      // If the input is empty, clear the users list
      setUsers([]);
    }
  }, [inputValue]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleUserClick = (userId) => {
    // Redirect to the user profile page using the user's ID
    navigate(`/profile/${userId}`);
  };
  return (
    <div className='search_container'>
      <div className='search_bar'>
          <input
            type="text"
            placeholder="Search Friend"
            value={inputValue}
            onChange={handleInputChange}
          />
      </div>
      <div className='search_result'>
        {users.length > 0 && users.map((user) => {
          return(
            <div className='friend' id={user._id} onClick={()=>{handleUserClick(user._id)}}>
              <div className='pic'><img src={user.Photo?user.Photo:picLink}/></div>
              <div className='content'><p>{user.name}</p></div>
            </div>
          );
        })}
      </div>
    </div>
  );
};


  // <li key={user.__id} onClick={() => handleUserClick(user.__id)}>
  //             <img src={user.Photo} alt={`Profile of ${user.username}`} />
  //             <div>
  //               <p>ID: {user.__id}</p>
  //               <p>Username: {user.username}</p>
  //             </div>
  //           </li>
