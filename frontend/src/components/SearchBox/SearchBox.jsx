import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SearchBox.css'; // We will create this next

const SearchBox = () => {
    const [keyword, setKeyword] = useState('');
    const navigate = useNavigate();

    const submitHandler = (e) => {
        e.preventDefault();
        if (keyword.trim()) {
            // Sends search term to your paintings page
            navigate(`/all-artworks?keyword=${keyword}`);
        } else {
            navigate('/all-artworks');
        }
    };

    return (
        <form onSubmit={submitHandler} className="search-box-form">
            <input
                type="text"
                name="q"
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Search Artniva..."
                className="search-input"
            />
            <button type="submit" className="search-btn">
                🔍
            </button>
        </form>
    );
};

export default SearchBox;