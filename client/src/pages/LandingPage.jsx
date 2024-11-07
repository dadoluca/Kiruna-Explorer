import React from 'react';
import styles from './LandingPage.module.css';
import { Link } from 'react-router-dom';


function LandingPage() {
  return (
    <div className={styles.landingContainer}>
      <div className={styles.content}>
        <h1 className={styles.title}>Welcome to Kiruna Explorer</h1>
        <p className={styles.description}>
          Discover the journey of Kiruna! Our platform allows visitors to explore the city's history,
          learn about its transformation, and access key documents related to various landmarks.
          For urban planners, Kiruna Explorer provides tools to add, manage, and link documents, 
          helping build the evolving story of the city.
        </p>
        <Link to="/map" className={styles.mapButton}>
        Discover Kiruna
        </Link>
      </div>
      <img
        src="/kiruna.jpg"
        alt="Kiruna City at sunrise"
        className={styles.headerImage}
      />
    </div>
  );
}

export default LandingPage;
