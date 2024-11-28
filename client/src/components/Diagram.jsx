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
            image: doc.image
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
        const margin = { top: 20, right: 20, bottom: 40, left: 90 };

        d3.select(svgRef.current).selectAll("*").remove(); // Pulizia dell'SVG

        // Creazione dell'SVG
        const svg = d3
            .select(svgRef.current)
            .attr("width", width)
            .attr("height", height);

        // Scale
        const xScale = d3
            .scaleBand()
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
        .attr("transform", `translate(${margin.left}, ${margin.top})`)
        .call(yAxis);

        svg.append("g")
        .attr("transform", `translate(${margin.left}, ${height - margin.bottom})`)
        .call(xAxis);

        /*
        svg.append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(xAxis)
            .append("text")
            .attr("x", width / 2)
            .attr("y", 35)
            .attr("fill", "black");

        svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(yAxis)
            .append("text")
            .attr("x", -height / 2)
            .attr("y", -40)
            .attr("transform", "rotate(-90)")
            .attr("fill", "black");
        */
        // Nodes

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
