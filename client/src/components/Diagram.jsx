import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { useState, useContext } from "react";
import API from "../services/api";

const Diagram = () => {
    const [nodes, setNodes] = useState([]);
    const [docList, setDocumentList] = useState([]);
    const [scaleNodes, setScaleNodes] = useState([]);   // Nodi per le scale numeriche, usati solo per aggiornare dinamicamente l'asse Y

    const [xDomain, setXDomain] = useState(range(2004, 2024, 1)); // Range iniziale per l'asse X
    const [yDomain, setYDomain] = useState(["Blueprints/effects", "Concept", "Text"]);    // Range iniziale per l'asse Y

    //Functions
    function range(start, end) {
        if (start > end) {
            return []; // Gestione di un range vuoto
        }
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }

    function parseNumber(str) {
        return parseFloat(str.replace(/[.,]/g, ''));
    }    

    const extractYear = (dataString) => {
        // Regex per validare e catturare l'anno dal formato dd/mm/yyyy
        const match = dataString.match(/^(?:(\d{2})\/)?(\d{2})\/(\d{4})|(\d{4})$/);
        if (!match) {
            throw new Error("Date format is not valid. Must be dd/mm/yyyy.");
        }

        return match[3] || match[4];
    }

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
    }, [docList]); 

    useEffect(() => {
        if (nodes.length > 0) {
            //Min/max year
            const newXDomain = range(
                Math.min(...nodes.map((node) => node.time)), 
                Math.max(...nodes.map((node) => node.time)), 
                1
            );

            //Min/max scale
            const regex = /^1 :/;

            setScaleNodes(() => [
                ...nodes.filter((node) => regex.test(node.scale)).map((node)=>node.scale)
            ]);

            const newYDomainR = [...new Set(scaleNodes.sort((a, b)=>{
                const numA = parseNumber(a.split(":")[1].trim());
                const numB = parseNumber(b.split(":")[1].trim());

                return numA - numB;
            }))];

            const newYDomain = ["blueprints/effects", ...newYDomainR, "Concept", "Text"];
    
            //Update axis' domains
            setXDomain(newXDomain);
            setYDomain(newYDomain);
        }
    }, [nodes]);
    

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
        const width = 1000;
        const height = 300;
        const margin = { top: 20, right: 20, bottom: 40, left: 100 };

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
            .range([0, width]);

        const yScale = d3
            .scaleBand()
            .domain(yDomain)
            .range([height-margin.top-margin.bottom, 0]);

        // Axis
        const xAxis = d3.axisTop(xScale).tickValues(xDomain).tickFormat(d3.format("d"));
        const yAxis = d3.axisLeft(yScale).tickValues(yDomain);

        svg.append("g")
        .attr("transform", `translate(${margin.left-10}, ${margin.top+10})`)
        .call(yAxis);

        svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`)
        .call(xAxis);

        // Nodes
        console.log(nodes);

        const nodesGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top+9})`) // Align with axes
        .selectAll("circle")
        .data(nodes)
        .enter()
        .append("image")
        .attr("xlink:href", (d) => d.image)
        .attr("x", (d) => xScale(parseInt(d.time)) - 10) // Adjust positioning
        .attr("y", (d) => yScale(d.scale) - 10)
        .attr("width", 20)
        .attr("height", 20);
        /*
        .enter()
        .append("circle")
        .attr("cx", (d) => xScale(parseInt(d.time)) ) // Center the node in the band
        .attr("cy", (d) => yScale(d.scale) + yScale.bandwidth() / 2) // Center the node in the band
        .attr("r", 6) // Node radius
        .attr("fill", "steelblue")
        .attr("stroke-width", 1.5);*/

        nodesGroup.append("text")
        .text((d) => toString(d.id)) // Use the label from the node data
        .attr("x", 0) // Center the text horizontally
        .attr("y", 12) // Position it below the node (radius + padding)
        .attr("text-anchor", "middle") // Center the text
        .attr("font-size", "10px")
        .attr("fill", "black");
            

        /*
        // Disegna i nodi con immagini
        svg.selectAll(".node")
        .data(nodes)
        .enter()
        .append("image")
        .attr("class", "node")
        .attr("x", (d) => xScale(d.time) - 15) // Offset per centrare l'immagine
        .attr("y", (d) => yScale(d.scale) - 15) // Offset per centrare l'immagine
        .attr("width", 30) // Larghezza immagine
        .attr("height", 30) // Altezza immagine
        .attr("xlink:href", (d) => d.image) // Imposta il link all'immagine
        .style("cursor", "pointer")
        .append("title")
        .text((d) => d.label); // Tooltip
        */
    }, [xDomain, yDomain, nodes]);

    return <svg ref={svgRef}></svg>;
};

export default Diagram;
