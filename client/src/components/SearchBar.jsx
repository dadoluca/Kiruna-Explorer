import React, { useState, useContext } from "react";
import styles from './SearchBar.module.css'; 
import { DocumentContext } from '../contexts/DocumentContext'; 
import { FaSearch } from "react-icons/fa"; // Import the search icon
  
const SearchBar = ({ onFilter }) => {
  const { documents } = useContext(DocumentContext); // Fetch documents from context
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const extractSnippet = (text, query) => {
    const queryIndex = text.toLowerCase().indexOf(query.toLowerCase());
    if (queryIndex === -1) return null;

    const start = Math.max(0, queryIndex - 15);
    const end = Math.min(text.length, queryIndex + query.length + 15);
    return `...${text.slice(start, end)}...`;
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchTerm(query);

    if (query === "") {
      onFilter("All");
    }

    // Filter suggestions based on the query
    if (query) {
      const filteredSuggestions = documents
        .filter(doc => 
          doc.title.toLowerCase().includes(query.toLowerCase()) ||
          doc.description.toLowerCase().includes(query.toLowerCase())
        )
        .map(doc => ({
          title: doc.title,
          match: doc.title.toLowerCase().includes(query.toLowerCase())
            ? null
            : extractSnippet(doc.description, query)
        }));
      setSuggestions(filteredSuggestions.slice(0, 4)); // Limit to 4 suggestions
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (title) => {
    setSearchTerm(title);
    setSuggestions([]);
    onFilter(title); // Call parent handler with filtered documents
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const filteredDocs = documents.filter(doc =>
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    onFilter(filteredDocs.length ? filteredDocs : "All");
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
        <button type="submit" className={styles.button}>
          <FaSearch className={styles.searchIcon} /> 
        </button>      
      </form>

      {suggestions.length > 0 && (
        <ul className={styles.suggestions}>
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              onClick={() => handleSuggestionClick(suggestion.title)}
              className={styles.suggestionItem}
            >
              <strong>{suggestion.title}</strong>
              {suggestion.match && (
                <p className={styles.matchText}>{suggestion.match}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
