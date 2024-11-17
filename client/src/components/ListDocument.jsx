import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import './ListDocument.module.css'; 
import CardDoc from "./CardDocVisualization";

const ScrollableDocumentsList = ({markers}) => {
  return (
    <div className="scrollable-card-list">
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