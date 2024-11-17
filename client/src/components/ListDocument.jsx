import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import styles from './ListDocument.module.css'; 
import CardDoc from "./CardDocVisualization";

const ScrollableDocumentsList = ({markers}) => {
    console.log(markers);

    return (
        <div className={styles.scrollableCardList}>
            <h4 className={styles.scrollbarTitle}>Document Types</h4>
            {markers.map((doc, index) => (
                <CardDoc
                    key={index}
                    title={doc.title}
                    description={doc.description}
                />
            ))}
        </div>
    );
};

export default ScrollableDocumentsList;