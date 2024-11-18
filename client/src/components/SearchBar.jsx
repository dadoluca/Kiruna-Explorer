import React, { useState, useContext } from "react";
import styles from './SearchBar.module.css'; 
import { DocumentContext } from '../contexts/DocumentContext'; 
import { FaSearch } from "react-icons/fa"; // Import the search icon
  
const SearchBar = ({ onFilter }) => {
  const { documents } = useContext(DocumentContext); // Fetch documents from context
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchTerm(query);

    // Filter suggestions based on the query
    if (query) {
      const filteredSuggestions = documents
        .filter(doc => doc.title.toLowerCase().includes(query.toLowerCase()))
        .map(doc => doc.title);
      setSuggestions(filteredSuggestions.slice(0, 5)); // Limit to 5 suggestions
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (title) => {
    setSearchTerm(title);
    setSuggestions([]);
    const filteredDocs = documents.filter(doc => doc.title === title);
    onFilter(filteredDocs); // Call parent handler with filtered documents
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const filteredDocs = documents.filter(doc =>
      doc.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    onFilter(filteredDocs);
  };

  return (
    <div className={styles.searchBar}>
      <form onSubmit={handleSearchSubmit} className={styles.form}>
        <input
          type="text"
          placeholder="Search documents..."
          value={searchTerm}
          onChange={handleSearchChange}
          className={styles.input}
        />
        <button type="button" className={styles.button}>
          <FaSearch className={styles.searchIcon} /> 
        </button>      
      </form>

      {suggestions.length > 0 && (
        <ul className={styles.suggestions}>
          {suggestions.map((title, index) => (
            <li
              key={index}
              onClick={() => handleSuggestionClick(title)}
              className={styles.suggestionItem}
            >
              {title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
