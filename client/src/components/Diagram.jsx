import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { useDocumentContext } from '../contexts/DocumentContext';

const Diagram = () => {
    const [scaleNodes, setScaleNodes] = useState([]);   // Nodes for numeric scales, used only to dynamically update the Y-axis
    const [scaleNodesT, setScaleNodesT] = useState([]);   // Nodes for numeric scales, used only to dynamically update the Y-axis
    const { documents } = useDocumentContext(); // Accessing documents from context
    const { handleVisualization, highlightedNode, setHighlightedNode, handleDocCardVisualization } = useDocumentContext(); // Accessing handleVisualization from context
    const [xDomain, setXDomain] = useState(range(2004, 2024)); // Initial range for the X-axis (years)
    const [yDomain, setYDomain] = useState(["Blueprints/effects", "Concept", "Text"]);    // Initial range for the Y-axis (scales)
    const [links, setLinks] = useState([]); // State for calculated links

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

    function showPopup(x, y, textContent, svgWidth) {
        const popup = d3.select(".node-popup");
    
        const textElement = popup.select("text").text(textContent);
    
        const textBBox = textElement.node().getBBox();
    
        const padding = 10;
        const rectWidth = textBBox.width + padding * 2;
        const rectHeight = textBBox.height + padding * 2;
    
        popup.select("rect")
            .attr("width", rectWidth)
            .attr("height", rectHeight);
    
        let popupX = x - rectWidth / 2; 
        let popupY = y - rectHeight - 10; 
    
        if (popupX < 0) popupX = 0; 
        if (popupX + rectWidth > svgWidth) popupX = svgWidth - rectWidth; 
        if (popupY < 0) popupY = y + 10; 
    
        popup.attr("transform", `translate(${popupX}, ${popupY})`);
    
        popup.style("visibility", "visible");
    }
    
    function hidePopup() {
        d3.select(".node-popup").style("visibility", "hidden");
    }
    

    // Function to extract the year from a document's date
    const extractYear = (dataString) => {
        const match = dataString.match(/^(\d{4})-(\d{2})-(\d{2})$|^(\d{4})-(\d{2})$|^(\d{4})$/); // Regex for validating and extracting the year
        if (!match) {
            throw new Error("Date format is not valid. Must be yyyy-mm-dd, yyyy-mm or yyyy.");
        }

        return match[1] || match[4] || match[6]; // Return the extracted year
    }

    // Function to transform a date in a decimal
    const parseDate = (dateString) => {
        const parts = dateString.split('-').map(part => parseInt(part, 10));

        if (parts.length === 3) {
            // yyyy-mm-dd
            const year = parts[0];
            const month = parts[1];
            const day = parts[2];
            return year + (month - 1) / 12 + (day - 1) / 365; // Fractions of month and year
        } else if (parts.length === 2) {
            // yyyy-mm
            const year = parts[0];
            const month = parts[1];
            return year + (month - 1) / 12; // Fractions of the year
        } else if (parts.length === 1) {
            // yyyy
            return parts[0];
        } else {
            throw new Error("Not supported date format: " + dateString);
        }
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

    // Function for drag's constraints
    const getMovementConstraints = (dateString) => {
        const parts = dateString.split('-').map(part => parseInt(part, 10));
    
        if (parts.length === 3) {
            // yyyy-mm-dd: Can't move
            return { type: 'fixed', min: null, max: null };
        } else if (parts.length === 2) {
            // yyyy-mm: Can move only in month
            const monthStart = parseDate(`${parts[0]}-${parts[1]}-01`); // First day of the month
            const monthEnd = parseDate(`${parts[0]}-${parts[1]}-28`); // Last day of the month
            return { type: 'month', min: monthStart, max: monthEnd };
        } else if (parts.length === 1) {
            // yyyy: Can move only in year
            const yearStart = parseDate(`${parts[0]}-01-01`); // First day of the year
            const yearEnd = parseDate(`${parts[0]}-12-31`); // Last day of the year
            return { type: 'year', min: yearStart, max: yearEnd };
        }
    };

    // Effect to update domains (X and Y) and calculate links when documents change
    useEffect(() => {
        if (documents.length > 0) {
            // Update the X-axis domain based on the min/max year from documents
            const newXDomain = range(
                Math.min(...documents.map((doc) => extractYear(doc.issuance_date.toString()))), 
                Math.max(...documents.map((doc) => extractYear(doc.issuance_date.toString()))) + 1
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
        const newYDomainR = [...new Set(scaleNodes.toSorted((a, b) => {
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
        const width = 1200;
        const height = 300;
        const margin = { top: 20, right: 20, bottom: 40, left: 300 };
    
        d3.select(svgRef.current).selectAll("*").remove(); // Clear previous SVG content
    
        // Create SVG element
        const svg = d3
            .select(svgRef.current)
            .attr("width", "97%")
            .attr("height", "100%")
            .attr("viewBox", `0 0 ${width} ${height + margin.top}`)
            .attr("preserveAspectRatio", "xMidYMid meet");

        // Append a group for all chart content
        const contentGroup = svg.append("g")
            .attr("class", "content-group")
            .attr("transform", `translate(0, ${margin.top})`);

        // Add zoom behavior
        const zoom = d3.zoom()
            .scaleExtent([0.5, 5]) // Min and max zoom levels
            .on("zoom", (event) => {
                contentGroup.attr("transform", event.transform);

                nodes.selectAll("image")
                    .attr("width", 20 / event.transform.k)
                    .attr("height", 20 / event.transform.k)
                    .attr("x", (d) => -(20 / event.transform.k) / 2)
                    .attr("y", (d) => -(20 / event.transform.k) / 2);

                nodes.selectAll("rect")
                    .attr("width", 30 / event.transform.k)
                    .attr("height", 30 / event.transform.k)
                    .attr("x", (d) => -(30 / event.transform.k) / 2)
                    .attr("y", (d) => -(30 / event.transform.k) / 2)
                    .attr("rx", 5 / event.transform.k)
                    .attr("ry", 5 / event.transform.k)
                    .attr("stroke-width", 2 / event.transform.k);

                allLinks.attr("stroke-width", 1 / event.transform.k);

                popup.selectAll("rect")
                .attr("width", Math.max(150 / event.transform.k, 60)) 
                .attr("height", Math.max(50 / event.transform.k, 30)); 
    
                popup.selectAll("text")
                    .attr("x", 10) 
                    .attr("y", Math.max(20 / event.transform.k, 15)) 
                    .attr("font-size", Math.max(12 / event.transform.k, 8)); 
    
                linkPopup.selectAll("rect")
                    .attr("width", Math.max(120 / event.transform.k, 80)) 
                    .attr("height", Math.max(40 / event.transform.k, 20)); 

                linkPopup.selectAll("text")
                    .attr("x", function () {
   
                        const rectWidth = Math.max(120 / event.transform.k, 80);
                        return rectWidth / 2;
                    })
                    .attr("y", function () {
               
                        const rectHeight = Math.max(40 / event.transform.k, 20);
                        return rectHeight / 2 + (Math.max(8 / event.transform.k, 8) / 3);
                    })
                    .attr("font-size", Math.max(8 / event.transform.k, 6)) 
                    .attr("text-anchor", "middle"); 

                contentGroup.selectAll(".x-grid line")
                    .style("stroke-width", 0.5 / event.transform.k);

                contentGroup.selectAll(".y-grid line")
                    .style("stroke-width", 0.5 / event.transform.k);
            });

        svg.call(zoom);
    
        // Scales for X and Y axes
        const xScale = d3
            .scaleTime()
            .domain([
                d3.min(documents, (d) => parseDate(d.issuance_date.toString())),
                d3.max(documents, (d) => parseDate(d.issuance_date.toString())) + 1
            ])
            .range([0, width - margin.left - margin.right]);
    
        const yScale = d3
            .scaleBand()
            .domain(yDomain)
            .range([height - margin.top - margin.bottom, 0]);
    
        // Axis creation
        const xAxis = d3.axisTop(xScale).tickValues(xDomain).tickFormat(d3.format("d"));
        const yAxis = d3.axisLeft(yScale).tickValues(yDomain);
    
        contentGroup.append("g")
            .attr("transform", `translate(${margin.left - 30}, ${margin.top + 10})`)
            .call(yAxis);
    
        contentGroup.append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`)
            .call(xAxis);

        // Grids creation
        const xGrid = d3.axisBottom(xScale)
            .tickValues(range(
                Math.min(...documents.map((doc) => parseInt(extractYear(doc.issuance_date.toString())))),
                Math.max(...documents.map((doc) => parseInt(extractYear(doc.issuance_date.toString()))))
            ))
            .tickSize(-(height - margin.top - margin.bottom)) // Grid lines extend the height of the chart
            .tickFormat("");

        // Append X grid
        contentGroup.append("g")
            .attr("class", "x-grid")
            .attr("transform", `translate(${margin.left}, ${margin.top + height - margin.top - margin.bottom})`)
            .call(xGrid)
            .selectAll("line")
            .style("stroke", "#888");

        // Manual Y Grid (for alignment with band scale)
        const yGridGroup = contentGroup.append("g")
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

        // Drag for nodes
        const drag = d3.drag()
            .on("start", function (event, d) {
                d3.select(this).raise().classed("active", true);
            })
            .on("drag", function (event, d) {
                const constraints = getMovementConstraints(d.issuance_date.toString());

                if (constraints.type === 'fixed') {
                    return;
                }

                let newX = event.x;
                let newY = event.y;

                const bandWidth = yScale.bandwidth();
                const originalY = yScale(d.scale);

                newX = Math.max(Math.min(newX, xScale(constraints.max)), xScale(constraints.min));
                newY = Math.max(Math.min(newY, originalY + bandWidth * 0.45), originalY - bandWidth * 0.45);

                d.fx = newX;
                d.fy = newY;

                d3.select(this)
                    .attr("transform", `translate(${d.fx}, ${d.fy})`);

                allLinks
                    .attr("d", (link) => calculateLinkPath(link));
            })
            .on("end", function (event, d) {
                d3.select(this).classed("active", false);
            });

        const nodesData = documents.map((d) => {
            const x = xScale(parseDate(d.issuance_date));
            const validScale = yDomain.includes(d.scale) ? d.scale : yDomain[0];
            const y = yScale(validScale);
            return { ...d, x, y, fx: x, fy: y, originalX: x, originalY: y };
        });

        const groupedNodes = d3.group(nodesData, (d) => `${parseDate(d.issuance_date.toString())}-${d.scale}`);

        const simulation = d3.forceSimulation(nodesData)
            .force("collide", d3.forceCollide(20))
            .alphaDecay(0.1)
            .on("tick", () => {
                nodes.attr("transform", (d) => `translate(${d.x}, ${d.y})`);
            });

        simulation.stop();

        let openClusters = new Set();
        const toggleCluster = (groupKey, nodesInGroup) => {
            if (openClusters.has(groupKey)) {
                // Close cluster
                openClusters.delete(groupKey);
                nodesInGroup.forEach((n) => {
                    n.fx = n.originalX;
                    n.fy = n.originalY;
                });
            } else {
                // Open cluster
                openClusters.add(groupKey);
                const angleStep = (2 * Math.PI) / nodesInGroup.length;
                nodesInGroup.forEach((n, i) => {
                    const radius = 30;
                    n.fx = n.originalX + radius * Math.sin(i * angleStep);
                    n.fy = n.originalY + radius * Math.cos(i * angleStep);
                });
            }

            allLinks
                .attr("d", (link) => calculateLinkPath(link));

            simulation.alpha(0.3).restart();
        };

        // LINKS
        const linksGroup = contentGroup.append("g").attr("transform", `translate(${margin.left}, ${margin.top + 20})`);

        const allLinks  = linksGroup
            .selectAll("path")
            .data(links, (link) => `${link.source}-${link.target}`)
            .join(
                enter => {
                    const group = enter.append("path")
                        .attr("d", (link) => {
                            return calculateLinkPath(link);
                        });      
                    return group;
                },
                update => {
                    update
                        .attr("d", (link) => {
                            return calculateLinkPath(link);
                        });
                    return update;
                },
                exit => exit.remove()
            )
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
                return color;
            })
            .attr("stroke-width", 1)
            .attr("stroke-dasharray", (d) => getLinkStyle(d.type)) // Style for each link

        function calculateLinkPath(link) {
            const sourceNode = nodesData.find((doc) => doc._id === link.source);
            const targetNode = nodesData.find((doc) => doc._id === link.target);
        
            const sourcePos = {
                x: sourceNode.fx !== undefined ? sourceNode.fx : sourceNode.originalX,
                y: sourceNode.fy !== undefined ? sourceNode.fy : sourceNode.originalY
            };
        
            const targetPos = {
                x: targetNode.fx !== undefined ? targetNode.fx : targetNode.originalX,
                y: targetNode.fy !== undefined ? targetNode.fy : targetNode.originalY
            };

            const offset = links.filter(l => l.source === link.source && l.target === link.target).indexOf(link) * 15;

            const midX = ((sourcePos.x + offset) + (targetPos.x + offset)) / 2;  // Midpoint for the curve
        
            return `M ${sourcePos.x} ${sourcePos.y} C ${midX} ${sourcePos.y} ${midX} ${targetPos.y} ${targetPos.x} ${targetPos.y}`;
        }

        const linkPopup = linksGroup.append("g")
            .attr("class", "link-popup")
            .style("visibility", "hidden");

        linkPopup.append("rect")
            .attr("width", 180)
            .attr("height", 30)
            .attr("rx", 5)
            .attr("fill", "rgba(0, 0, 0, 0.8)")
            .attr("stroke", "#ffffff")
            .attr("stroke-width", 1);

        linkPopup.append("text")
            .attr("x", 10)
            .attr("y", 20)
            .attr("font-size", 12)
            .attr("fill", "#ffffff");


        allLinks.on("mouseover", function (event, d) {
            const transform = d3.zoomTransform(svg.node());

            const mouseX = event.clientX;
            const mouseY = event.clientY;
        
            const svgPoint = svg.node().createSVGPoint();
            svgPoint.x = mouseX;
            svgPoint.y = mouseY;
        
            const localPoint = svgPoint.matrixTransform(svg.node().getScreenCTM().inverse());

            let popupX = ((localPoint.x - transform.x) / transform.k) - 10;  
            let popupY = ((localPoint.y - transform.y) / transform.k) - 10; 
        
            popupX += -400;
            popupY += -110;
        
            popupX = Math.min(Math.max(popupX, 0), width);
            popupY = Math.min(Math.max(popupY, 0), height + margin.top);
        
            linkPopup
                .attr("transform", `translate(${popupX}, ${popupY})`)
                .style("visibility", "visible");
        
            linkPopup.select("text").text(`Type: ${d.type}`);
        })
        .on("mousemove", function (event) {
            const transform = d3.zoomTransform(svg.node());
        
            const mouseX = event.clientX;
            const mouseY = event.clientY;
        
            const svgPoint = svg.node().createSVGPoint();
            svgPoint.x = mouseX;
            svgPoint.y = mouseY;
        
            const localPoint = svgPoint.matrixTransform(svg.node().getScreenCTM().inverse());
        
            let popupX = ((localPoint.x - transform.x) / transform.k) - 10;  
            let popupY = ((localPoint.y - transform.y) / transform.k) - 10;  
        
            popupX += -400;
            popupY += -110;
        
            linkPopup.attr("transform", `translate(${popupX}, ${popupY})`);
        })
        .on("mouseout", function () {
            linkPopup.style("visibility", "hidden");
        });

        // NODES
        const nodesGroup = contentGroup.append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top + 20})`) // Align with the axes

        const nodes = nodesGroup
            .selectAll("g.node-group")
            .data(nodesData, (d) => d._id)  // Use a unique key
            .join(
                enter => { 
                    const group = enter.append("g")
                        .attr("class", "node-group")
                        .attr("transform", (d) => `translate(${d.fx}, ${d.fy})`)
                        .on("click", (event, d) => {
                            event.stopPropagation();
                            event.preventDefault();

                            const groupKey = `${parseDate(d.issuance_date.toString())}-${d.scale}`;
                            const nodesInGroup = groupedNodes.get(groupKey);

                            if (nodesInGroup && nodesInGroup.length === 1 || openClusters.has(groupKey))
                                handleDocCardVisualization(d);
                        })
                        .on("dblclick", (event, d) => {
                            event.stopPropagation();
                            event.preventDefault();
            
                            const groupKey = `${parseDate(d.issuance_date.toString())}-${d.scale}`;
                            const nodesInGroup = groupedNodes.get(groupKey);
            
                            if (nodesInGroup && nodesInGroup.length > 1)
                                toggleCluster(groupKey, nodesInGroup);
                        });

                    group.append("rect")
                        .attr("x", -15) // Posizionamento relativo all'immagine
                        .attr("y", -15)
                        .attr("width", 30) // Dimensioni leggermente più grandi dell'immagine
                        .attr("height", 30)
                        .attr("rx", 5)  // Aggiungi il raggio per angoli arrotondati
                        .attr("ry", 5)
                        .attr("fill", "none")
                        .attr("stroke", "red")
                        .attr("stroke-width", 2)
                        .attr("class", "highlight-rect")
                        .style("display", (d) => d._id === highlightedNode ? "block" : "none");

                    group.append("image")
                        .attr("xlink:href", (d) => d.icon) // Node image source
                        .attr("x", -10) // Center the image relative to the node
                        .attr("y", -10)
                        .attr("width", 20)
                        .attr("height", 20)

                    return group;
                },
                update => {const group = update // Update the position of existing nodes
                    .attr("transform", (d) => `translate(${d.fx}, ${d.fy})`);

                    group.select("rect.highlight-rect")
                    .style("display", (d) => d._id === highlightedNode ? "block" : "none");

                    return group;
                },
                exit => exit.remove()  // Remove nodes if necessary
            );

        nodes.call(drag);

        // Append hidden popup container
        const popup = nodesGroup.append("g")
        .attr("class", "node-popup")
        .style("visibility", "hidden");

        popup.append("rect")
            .attr("width", 150)
            .attr("height", 50)
            .attr("rx", 5) // Rounded corners
            .attr("fill", "rgba(255, 255, 255, 0.9)")
            .attr("stroke", "black")
            .attr("stroke-width", 1);

        popup.append("text")
            .attr("x", 10)
            .attr("y", 25)
            .attr("font-size", 12)
            .attr("fill", "black");

        // Show and hide popup on mouseover and mouseout
        nodes.on("mouseover", function (event, d) {
            const content = d.title || "Node without title"; 
            showPopup(d.fx, d.fy, content, width-margin.left-margin.right);
        })
        .on("mouseout", function () {
            hidePopup();
        });

        //LEGEND
        const legendGroup = svg.append("g")
        .attr("class", "legend-group")
        .attr("transform", `translate(${10}, ${margin.top})`);

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
        const padding = 20;
        const rowHeight = 25;
        const fontSize = 12;

        const legendWidth = d3.max(legendData, d => {
            const textWidth = d.label.length * fontSize * 0.6;
            return 20 + textWidth;
        });
        const legendHeight = legendData.length * rowHeight;

        legendGroup.append("rect")
            .attr("x", -padding / 2)
            .attr("y", -padding / 2)
            .attr("width", legendWidth + padding)
            .attr("height", legendHeight + padding)
            .attr("fill", "white")
            .attr("opacity", 0.85)
            .attr("rx", 5)
            .attr("ry", 5);

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
    }, [documents, xDomain, yDomain, links, highlightedNode]);

    return (
        <svg ref={svgRef}></svg>
    );
};

export default Diagram;