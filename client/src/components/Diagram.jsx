import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { useDocumentContext } from '../contexts/DocumentContext';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import styles from './Diagram.module.css';

const Diagram = ({ isDiagramOpen, setIsDiagramOpen }) => {
    const [scaleNodes, setScaleNodes] = useState([]);   // Nodes for numeric scales, used only to dynamically update the Y-axis
    const [scaleNodesT, setScaleNodesT] = useState([]);   // Nodes for numeric scales, used only to dynamically update the Y-axis
    const { documents } = useDocumentContext(); // Accessing documents from context

    const [xDomain, setXDomain] = useState(range(2004, 2024)); // Initial range for the X-axis (years)
    const [yDomain, setYDomain] = useState(["Blueprints/effects", "Concept", "Text"]);    // Initial range for the Y-axis (scales)
    const [links, setLinks] = useState([]); // State for calculated links

    const handleToggleClick = () => {
        setIsDiagramOpen(!isDiagramOpen);
    };

    // Function to generate a range of numbers
    function range(start, end) {
        if (start > end) {
            return []; 
        }
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }

    // Function to parse numbers from strings
    function parseNumber(str) {
        return parseFloat(str.replace(/[.,]/g, ''));
    }

    // Function to extract the year from a document's date
    const extractYear = (dataString) => {
        const match = dataString.match(/^(\d{4})-(\d{2})-(\d{2})$|^(\d{4})-(\d{2})$|^(\d{4})$/); // Regex for validating and extracting the year
        if (!match) {
            throw new Error("Date format is not valid. Must be yyyy-mm-dd, yyyy-mm or yyyy.");
        }

        return match[1] || match[4] || match[6]; // Return the extracted year
    }

    // Function to calculate the radial position of nodes for circular layout
    const calculateRadialPosition = (index, total, centerX, centerY) => {
        if (isNaN(centerX) || isNaN(centerY)) {
            console.error("Invalid center coordinates:", { centerX, centerY });
            return { x: 0, y: 0 };
        }

        if (total <= 0) {
            console.error("Invalid total value:", total);
            return { x: 0, y: 0 };
        }

        const angle = (index / total) * 2 * Math.PI;
        const radius = 15;

        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        if (isNaN(x) || isNaN(y)) {
            console.error("Invalid radial position:", { index, total, centerX, centerY, x, y });
            return { x: 0, y: 0 };
        }

        return { x, y };
    };

    // Function to determine the style of links based on their type
    const getLinkStyle = (type) => {
        switch (type) {
            case "direct consequence":
                return "5,0";
            case "collateral consequence":
                return "5,5";
            case "projection":
                return "1,5";
            case "update":
                return "5,5,1,5";
            default:
                return "5,0";
        }
    };

    // Function to update the links based on the documents' relationships
    const updateLinks = () => {
        const linksArray = documents.flatMap((doc) =>
            doc.relationships.map((rel) => ({
                source: doc._id, // Source node
                target: rel.documentId, // Target node
                type: rel.type, // Relationship type
            }))
        );
    
        setLinks(() => [...linksArray]); // Update the links state
    };

    // Group nodes based on their issuance year and scale
    const groupedNodes = d3.group(documents, (d) => {
        const time = parseInt(extractYear(d.issuance_date.toString())); // Extract the year
        return `${time}-${d.scale}`; // Unique key for the combination of X and Y axes
    });

    // Effect to update domains (X and Y) and calculate links when documents change
    useEffect(() => {
        if (documents.length > 0) {
            // Update the X-axis domain based on the min/max year from documents
            const newXDomain = range(
                Math.min(...documents.map((doc) => extractYear(doc.issuance_date.toString()))), 
                Math.max(...documents.map((doc) => extractYear(doc.issuance_date.toString())))
            );

            // Update scale nodes based on scale format
            const regex = /^1\s*:\s*[\d.,]+$/;

            setScaleNodes(() => [
                ...documents.filter((doc) => regex.test(doc.scale)).map((doc) => doc.scale)
            ]);

            setScaleNodesT(() => [
                ...documents.filter((doc) => !regex.test(doc.scale)).map((doc) => doc.scale)
            ]);

            setXDomain(newXDomain);
            updateLinks(); // Recalculate links when documents change
        }
    }, [documents]);

    // Effect to update the Y-axis domain based on scale nodes
    useEffect(() => {
        const newYDomainR = [...new Set(scaleNodes.sort((a, b) => {
            const numA = parseNumber(a.split(":")[1].trim());
            const numB = parseNumber(b.split(":")[1].trim());
            return numA - numB;
        }))];

        const newYDomain = ["blueprints/effects", ...newYDomainR, "Concept", "Text", ...scaleNodesT];
    
        setYDomain(newYDomain);
    }, [scaleNodes]);

    // Diagram rendering
    const svgRef = useRef();

    useEffect(() => {
        if(!isDiagramOpen) return;

        const width = 1200;
        const height = 300;
        const margin = { top: 20, right: 20, bottom: 40, left: 300 };
    
        d3.select(svgRef.current).selectAll("*").remove(); // Clear previous SVG content
    
        // Create SVG element
        const svg = d3
            .select(svgRef.current)
            .attr("width", width)
            .attr("height", height);
    
        // Scales for X and Y axes
        const xScale = d3
            .scalePoint()
            .domain(xDomain)
            .range([0, width - margin.left - margin.right]);
    
        const yScale = d3
            .scaleBand()
            .domain(yDomain)
            .range([height - margin.top - margin.bottom, 0]);
    
        // Axis creation
        const xAxis = d3.axisTop(xScale).tickValues(xDomain).tickFormat(d3.format("d"));
        const yAxis = d3.axisLeft(yScale).tickValues(yDomain);
    
        svg.append("g")
            .attr("transform", `translate(${margin.left - 30}, ${margin.top + 10})`)
            .call(yAxis);
    
        svg.append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`)
            .call(xAxis);

        // Grids creation
        const xGrid = d3.axisBottom(xScale)
            .tickSize(-(height - margin.top - margin.bottom)) // Grid lines extend the height of the chart
            .tickFormat("");

        // Append X grid
        svg.append("g")
            .attr("class", "x-grid")
            .attr("transform", `translate(${margin.left}, ${margin.top + height - margin.top - margin.bottom})`)
            .call(xGrid)
            .selectAll("line")
            .style("stroke", "#888");

        // Manual Y Grid (for alignment with band scale)
        const yGridGroup = svg.append("g")
        .attr("class", "y-grid")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

        yDomain.forEach((d) => {
        const y = yScale(d) + yScale.bandwidth() / 2 + 10; // Center of the band
        yGridGroup.append("line")
            .attr("x1", 0)
            .attr("x2", width - margin.left - margin.right)
            .attr("y1", y)
            .attr("y2", y)
            .style("stroke", "#888");
        });
  
    
        // Update existing nodes instead of removing them
        svg.append("g")
            .attr("transform", `translate(${margin.left - 10}, ${margin.top + 25})`) // Align with the axes
            .selectAll("g.node-group")
            .data(documents, (d) => d._id)  // Use a unique key
            .join(
                enter => enter.append("g") // Create a new node if it doesn't exist
                    .attr("class", "node-group")
                    .attr("transform", (d) => {
                        const groupKey = `${parseInt(extractYear(d.issuance_date.toString()))}-${d.scale}`;
                        const group = groupedNodes.get(groupKey); // Get nodes in the same group
                        const index = group.indexOf(d); // Index of the node in the group
                        const validScale = yDomain.includes(d.scale) ? d.scale : yDomain[0];
                        const { x, y } = calculateRadialPosition(
                            index,
                            group.length,
                            xScale(parseInt(extractYear(d.issuance_date.toString()))),
                            yScale(validScale)
                        );
                        return `translate(${x}, ${y})`;
                    })
                    .append("image")
                    .attr("xlink:href", (d) => d.icon) // Node image source
                    .attr("x", -10) // Center the image relative to the node
                    .attr("y", -10)
                    .attr("width", 20)
                    .attr("height", 20),
                update => update // Update the position of existing nodes
                    .attr("transform", (d) => {
                        const groupKey = `${parseInt(extractYear(d.issuance_date.toString()))}-${d.scale}`;
                        const group = groupedNodes.get(groupKey); // Get nodes in the same group
                        const index = group.indexOf(d); // Index of the node in the group
                        const validScale = yDomain.includes(d.scale) ? d.scale : yDomain[0];
                        const { x, y } = calculateRadialPosition(
                            index,
                            group.length,
                            xScale(parseInt(extractYear(d.issuance_date.toString()))),
                            yScale(validScale)
                        );
                        return `translate(${x}, ${y})`;
                    }),
                exit => exit.remove()  // Remove nodes if necessary
            );

        // Draw links between nodes based on calculated links
        svg.append("g")
        .attr("transform", `translate(${margin.left - 10}, ${margin.top + 25})`)
        .selectAll("path")
        .data(links)
        .join("path")
        .attr("d", (link) => {
            const sourceNode = documents.find((doc) => doc._id === link.source);
            const targetNode = documents.find((doc) => doc._id === link.target);
            const sourceKey = `${parseInt(extractYear(sourceNode.issuance_date.toString()))}-${sourceNode.scale}`;
            const targetKey = `${parseInt(extractYear(targetNode.issuance_date.toString()))}-${targetNode.scale}`;

            const sourceGroup = groupedNodes.get(sourceKey);
            const targetGroup = groupedNodes.get(targetKey);

            const sourceIndex = sourceGroup.indexOf(sourceNode);
            const targetIndex = targetGroup.indexOf(targetNode);

            const validSourceScale = yDomain.includes(sourceNode.scale) ? sourceNode.scale : yDomain[0];
            const validTargetScale = yDomain.includes(targetNode.scale) ? targetNode.scale : yDomain[0];

            const sourcePos = calculateRadialPosition(
                sourceIndex,
                sourceGroup.length,
                xScale(parseInt(extractYear(sourceNode.issuance_date.toString()))),
                yScale(validSourceScale)
            );

            const targetPos = calculateRadialPosition(
                targetIndex,
                targetGroup.length,
                xScale(parseInt(extractYear(targetNode.issuance_date.toString()))),
                yScale(validTargetScale)
            );

            // Use a cubic Bezier curve for a smooth connection
            const midX = (sourcePos.x + targetPos.x) / 2;  // Midpoint for the curve
            //const midY = (sourcePos.y + targetPos.y) / 2;  // Midpoint for the curve

            return `M ${sourcePos.x} ${sourcePos.y} C ${midX} ${sourcePos.y} ${midX} ${targetPos.y} ${targetPos.x} ${targetPos.y}`;
        })
        .attr("fill", "none")
        .attr("stroke", (d) => {
            let color;
            if (d.type === "direct consequence") {
                color = "#FF8C00";
            } else if (d.type === "collateral consequence") {
                color = "#32CD32";
            } else if (d.type === "projection") {
                color = "#D32F2F";
            } else {
                color = "#003366";
            }
            
            // Usage
            return color;
        })
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", (d) => getLinkStyle(d.type));

        //Legend
        const legendGroup = svg.append("g")
        .attr("class", "legend-group")
        .attr("transform", `translate(${0}, ${margin.top})`);

        const legendData = [
            { type: "direct consequence", style: "solid", label: "Direct Consequence", color: "#FF8C00" },
            { type: "collateral consequence", style: "dashed", label: "Collateral Consequence", color: "#32CD32" },
            { type: "projection", style: "dotted", label: "Projection", color: "#D32F2F" },
            { type: "update", style: "dash-dotted", label: "Update", color: "#003366" },
        ];
        
        const lineStyles = {
            solid: "",
            dashed: "5,5",
            dotted: "1,5",
            "dash-dotted": "5,5,1,5",
        };
        
        // Draw legend
        legendGroup.selectAll("g.legend-item")
            .data(legendData)
            .join(
                enter => {
                    const group = enter.append("g")
                        .attr("class", "legend-item")
                        .attr("transform", (d, i) => `translate(0, ${i * 25})`); // Vertical space between elements
        
                    // Legend line
                    group.append("line")
                        .attr("x1", 0)
                        .attr("y1", 10)
                        .attr("x2", 40)
                        .attr("y2", 10)
                        .attr("stroke", d => d.color)  // Set the line color based on the `color` property (using named colors)
                        .attr("stroke-width", 2)
                        .attr("stroke-dasharray", d => lineStyles[d.style]);
        
                    // Legend text
                    group.append("text")
                        .attr("x", 50)
                        .attr("y", 15)
                        .text(d => d.label)
                        .attr("font-size", 12)
                        .attr("fill", "black")
                        .attr("alignment-baseline", "middle");
                }
            );
    }, [documents, xDomain, yDomain, links, isDiagramOpen]);

    return (
        <div className={styles.diagramWrapper}>
            <div
                className={styles.toggleContainer}
                role="button" // Adds the semantic meaning of a button
                tabIndex={0}  // Makes the div focusable
                onClick={handleToggleClick} // Handles mouse clicks
                onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault(); // Prevent scrolling for Space key
                    handleToggleClick();
                }
                }} // Handles keyboard interactions
                aria-expanded={isDiagramOpen} // ARIA state for expanded/collapsed content
                aria-label="Toggle diagram" // Adds an accessible label
            >
                <ExpandMoreIcon
                className={`${styles.toggleIcon} ${isDiagramOpen ? styles.rotate : ''}`}
                fontSize="large"
                />
            </div>

    
          <svg ref={svgRef} className={`${styles.diagram} ${isDiagramOpen ? styles.openDiagram : styles.closedDiagram}`}></svg>
        </div>
    );
};

export default Diagram;