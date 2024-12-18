import React, { useState, useContext } from "react";
import PropTypes from 'prop-types'; 
import styles from './SearchBar.module.css'; 
import { DocumentContext } from '../contexts/DocumentContext'; 
import { FaSearch } from "react-icons/fa"; 
  
const SearchBar = ({ onFilter, inMap }) => {
  const { documents } = useContext(DocumentContext); 
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
      setSuggestions(filteredSuggestions.slice(0, 4)); 
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (title) => {
    setSearchTerm(title);
    setSuggestions([]);
    onFilter(title); 
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
      <form 
        onSubmit={handleSearchSubmit} 
        className={`${styles.form} ${inMap ? styles.inMap : ''}`}
      >
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


SearchBar.propTypes = {
  onFilter: PropTypes.func.isRequired,
  inMap: PropTypes.bool.isRequired,
};

export default SearchBar;
