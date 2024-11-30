import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { useState, useContext } from "react";
import API from "../services/api";

const Diagram = () => {
    const [docList, setDocumentList] = useState([]);
    const [scaleNodes, setScaleNodes] = useState([]);   // Nodi per le scale numeriche, usati solo per aggiornare dinamicamente l'asse Y
    const [scaleNodesT, setScaleNodesT] = useState([]);   // Nodi per le scale numeriche, usati solo per aggiornare dinamicamente l'asse Y

    const [xDomain, setXDomain] = useState(range(2004, 2024, 1)); // Range iniziale per l'asse X
    const [yDomain, setYDomain] = useState(["Blueprints/effects", "Concept", "Text"]);    // Range iniziale per l'asse Y

    //Functions
    function range(start, end) {
        if (start > end) {
            return []; 
        }
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }

    function parseNumber(str) {
        return parseFloat(str.replace(/[.,]/g, ''));
    }    

    const extractYear = (dataString) => {
        // Regex for validating and take the year from the date (foramt yyyy-mm-dd, yyyy-mm, yyyy)
        const match = dataString.match(/^(\d{4})-(\d{2})-(\d{2})$|^(\d{4})-(\d{2})$|^(\d{4})$/
);
        if (!match) {
            throw new Error("Date format is not valid. Must be yyyy-mm-dd, yyyy-mm or yyyy.");
        }

        return match[1] || match[4] || match[6];
    }

    const calculateRadialPosition = (index, total, centerX, centerY) => {
        const angle = (index / total) * 2 * Math.PI; // Angolo in radianti
        const radius = 15; // Raggio del cerchio
        return {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle)
        };
    };
    
    //Takes the nodes with same coordinates
    const groupedNodes = d3.group(docList, (d) => {
        const time = parseInt(extractYear(d.issuance_date.toString())); // Estrarre l'anno
        return `${time}-${d.scale}`; // Chiave unica per la combinazione di asse X e Y
    });
    

    /*
    //Use Effects for dynamic updates
    const addNodesFromDocs = (docs) => {
        const newNodes = docs.map((doc, index) => ({
            id: nodes.length + index + 1, 
            label: doc.title,
            type: doc.type,
            time: extractYear(doc.issuance_date.toString()),
            scale: doc.scale,
            image: doc.icon
        }));
        setNodes(() => [ ...newNodes]);
    };

    useEffect(() => {
        addNodesFromDocs(docList);
    }, [docList]); */

    useEffect(() => {
        if (docList.length > 0) {
            //Min/max year
            const newXDomain = range(
                Math.min(...docList.map((doc) => extractYear(doc.issuance_date.toString()))), 
                Math.max(...docList.map((doc) => extractYear(doc.issuance_date.toString()))), 
                1
            );

            //Min/max scale
            const regex = /^1\s*:\s*[\d.,]+$/;

            setScaleNodes(() => [
                ...docList.filter((doc) => regex.test(doc.scale)).map((doc)=>doc.scale)
            ]);

            setScaleNodesT(() => [
                ...docList.filter((doc) => !regex.test(doc.scale)).map((doc)=>doc.scale)
            ]);

            const newYDomainR = [...new Set(scaleNodes.sort((a, b)=>{
                const numA = parseNumber(a.split(":")[1].trim());
                const numB = parseNumber(b.split(":")[1].trim());

                return numA - numB;
            }))];

            console.log(newYDomainR);

            const newYDomain = ["blueprints/effects", ...newYDomainR, "Concept", "Text", ...scaleNodesT];
    
            //Update axis' domains
            setXDomain(newXDomain);
            setYDomain(newYDomain);
        }
    }, [docList]);
    

    //DIAGRAM
    const svgRef = useRef();

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const documents = await API.getDocuments();
                setDocumentList(documents);
            } catch (error) {
                console.error("Failed to fetch documents:", error);
            }
        };

        fetchDocuments();
    }, []);

    useEffect(() => {
        const width = 1010;
        const height = 300;
        const margin = { top: 20, right: 20, bottom: 40, left: 120 };

        d3.select(svgRef.current).selectAll("*").remove(); // Pulizia dell'SVG

        // Creazione dell'SVG
        const svg = d3
            .select(svgRef.current)
            .attr("width", width)
            .attr("height", height);

        // Scale
        const xScale = d3
            .scalePoint()
            .domain(xDomain)
            .range([0, width-margin.left-margin.right]);

        const yScale = d3
            .scaleBand()
            .domain(yDomain)
            .range([height-margin.top-margin.bottom, 0]);

        // Axis
        const xAxis = d3.axisTop(xScale).tickValues(xDomain).tickFormat(d3.format("d"));
        const yAxis = d3.axisLeft(yScale).tickValues(yDomain);

        svg.append("g")
        .attr("transform", `translate(${margin.left-30}, ${margin.top+10})`)
        .call(yAxis);

        svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`)
        .call(xAxis);

        // Nodes
        // Creazione dei nodi
        const nodesGroup = svg.append("g")
        .attr("transform", `translate(${margin.left-10}, ${margin.top+25})`) // Allinea agli assi
        .selectAll("g.node-group")
        .data(docList)
        .enter()
        .append("g")
        .attr("class", "node-group")
        .attr("transform", (d) => {
            const groupKey = `${parseInt(extractYear(d.issuance_date.toString()))}-${d.scale}`;
            const group = groupedNodes.get(groupKey); // Ottieni nodi nello stesso gruppo
            const index = group.indexOf(d); // Indice del nodo nel gruppo
            const { x, y } = calculateRadialPosition(
                index,
                group.length,
                xScale(parseInt(extractYear(d.issuance_date.toString()))),
                yScale(d.scale)
            );
            return `translate(${x}, ${y})`;
        });

        // Disegna le immagini per i nodi
        nodesGroup.append("image")
        .attr("xlink:href", (d) => d.icon) // Percorso dell'immagine
        .attr("x", -10) // Centrato rispetto al nodo
        .attr("y", -10)
        .attr("width", 20)
        .attr("height", 20);
        
        /*
        const nodesGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top+9})`) // Align with axes
        .selectAll("circle")
        .data(docList)
        .enter()
        .append("image")
        .attr("xlink:href", (d) => d.icon)
        .attr("x", (d) => xScale(parseInt(extractYear(d.issuance_date.toString()))) - 10) // Adjust positioning
        .attr("y", (d) => yScale(d.scale) - 10)
        .attr("width", 20)
        .attr("height", 20);
        */



        /*
        .enter()
        .append("circle")
        .attr("cx", (d) => xScale(parseInt(d.time)) ) // Center the node in the band
        .attr("cy", (d) => yScale(d.scale) + yScale.bandwidth() / 2) // Center the node in the band
        .attr("r", 6) // Node radius
        .attr("fill", "steelblue")
        .attr("stroke-width", 1.5);*/

        /*
        nodesGroup.append("text")
        .text((d) => toString(d.id)) // Use the label from the node data
        .attr("x", 0) // Center the text horizontally
        .attr("y", 12) // Position it below the node (radius + padding)
        .attr("text-anchor", "middle") // Center the text
        .attr("font-size", "10px")
        .attr("fill", "black");
        */

    }, [xDomain, yDomain, docList]);

    return <svg ref={svgRef}></svg>;
};

export default Diagram;
