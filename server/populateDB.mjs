import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Area from './models/Geolocation.mjs';
import Document from './models/Document.mjs';

dotenv.config();

const uri = process.env.MONGO_URI;

async function createDatabase() {
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    await Document.collection.drop();
    await Area.collection.drop();

    await Area.insertMany([{
      _id: Object("676245acadd74c13a204dfb1"),
      type: "Feature",
      properties: {
        centroid: {
          type: "Point",
          coordinates: [
            20.232698899999995,
            67.8517969
          ]
        },
        color: "#1de365"
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [20.229977, 67.852785],
            [20.229548, 67.851304],
            [20.233476, 67.850689],
            [20.234163, 67.849913],
            [20.235816, 67.851005],
            [20.234463, 67.851458],
            [20.235193, 67.852178],
            [20.234571, 67.85293],
            [20.229805, 67.852922],
            [20.229977, 67.852785],
            [20.229977, 67.852785]  // Chiude il poligono
          ]
        ]
      },
      __v: 0
    },
    {
      _id: Object("67624d1ea77f36d87ba0c634"),
      type: "Feature",
      properties: {
        centroid: {
          type: "Point",
          coordinates: [20.221942822222225, 67.8467422222222]
        },
        color: "#e30566"
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [20.202937, 67.857333],
            [20.199334, 67.857074],
            [20.197619, 67.855068],
            [20.198134, 67.853451],
            [20.202422, 67.853515],
            [20.20894, 67.852027],
            [20.209798, 67.850667],
            [20.209627, 67.848855],
            [20.21666, 67.848208],
            [20.220262, 67.847172],
            [20.226265, 67.8451],
            [20.22455, 67.84264],
            [20.224207, 67.840827],
            [20.221634, 67.837395],
            [20.218889, 67.837201],
            [20.222492, 67.835776],
            [20.225065, 67.836229],
            [20.227295, 67.835258],
            [20.229696, 67.835063],
            [20.233813, 67.834739],
            [20.237758, 67.835776],
            [20.233298, 67.837395],
            [20.235014, 67.838107],
            [20.233813, 67.839467],
            [20.236558, 67.840762],
            [20.236901, 67.84277],
            [20.238101, 67.843935],
            [20.234671, 67.844971],
            [20.237244, 67.845942],
            [20.236043, 67.847366],
            [20.231583, 67.846589],
            [20.227638, 67.848208],
            [20.234328, 67.848985],
            [20.231068, 67.849567],
            [20.227981, 67.850085],
            [20.224207, 67.85125],
            [20.221806, 67.850862],
            [20.22009, 67.851574],
            [20.219747, 67.85248],
            [20.217174, 67.85358],
            [20.214944, 67.853839],
            [20.214773, 67.85481],
            [20.2122, 67.85688],
            [20.207911, 67.857269],
            [20.202937, 67.857333],
            [20.202937, 67.857333]
          ]
        ]
      },
      __v: 0
    },
    {
      _id: Object("67624e2ff44609a1c739f5e2"),
      type: "Feature",
      properties: {
        centroid: {
          type: "Point",
          coordinates: [20.2115155625, 67.8579464375]
        },
        color: "#526c61"
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [20.205994, 67.861944],
            [20.202735, 67.861588],
            [20.204193, 67.859582],
            [20.207367, 67.858903],
            [20.210025, 67.858935],
            [20.210626, 67.858127],
            [20.212941, 67.857027],
            [20.214743, 67.855182],
            [20.216115, 67.855312],
            [20.216715, 67.854147],
            [20.218431, 67.854244],
            [20.218259, 67.855991],
            [20.2156, 67.856282],
            [20.213199, 67.858838],
            [20.211312, 67.859097],
            [20.205994, 67.861944],
            [20.205994, 67.861944]
          ]
        ]
      },
      __v: 0
    },
    {
      _id: Object("67625473d4e1e75b8fac1fd6"),
      type: "Feature",
      properties: {
        centroid: {
          type: "Point",
          coordinates: [20.301557777777777, 67.84946977777777]
        },
        color: "#8b0e69"
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [20.297759, 67.849792],
            [20.297158, 67.848384],
            [20.30761, 67.848262],
            [20.307975, 67.849233],
            [20.304992, 67.84933],
            [20.303704, 67.850892],
            [20.298725, 67.849929],
            [20.298338, 67.849614],
            [20.297759, 67.849792],
            [20.297759, 67.849792]
          ]
        ]
      },
      __v: 0
    },
    {
      _id: Object("676257d24ec519174223edd3"),
      type: "Feature",
      properties: {
        centroid: {
          type: "Point",
          coordinates: [20.292364357142862, 67.85180507142857]
        },
        color: "#439036"
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [20.278021, 67.84858],
            [20.279308, 67.850749],
            [20.275703, 67.853079],
            [20.273642, 67.854762],
            [20.273814, 67.856185],
            [20.276046, 67.857997],
            [20.296823, 67.855603],
            [20.304206, 67.854406],
            [20.309872, 67.852723],
            [20.316655, 67.848354],
            [20.317685, 67.848192],
            [20.316998, 67.847642],
            [20.296307, 67.848419],
            [20.278021, 67.84858],
            [20.278021, 67.84858]
          ]
        ]
      },
      __v: 0
    },
    {
      "_id": Object("676258a4d76298d6372c5064"),
      "type": "Feature",
      "properties": {
        "centroid": {
          "type": "Point",
          "coordinates": [
            20.222794,
            67.8440195625
          ]
        },
        "color": "#7b1a9f"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [20.214708, 67.851095],
            [20.214536, 67.849638],
            [20.216596, 67.846628],
            [20.221576, 67.845269],
            [20.222349, 67.842873],
            [20.221147, 67.83847],
            [20.220889, 67.835879],
            [20.223035, 67.833548],
            [20.230333, 67.833483],
            [20.231707, 67.834714],
            [20.232222, 67.845722],
            [20.231878, 67.846402],
            [20.230247, 67.846822],
            [20.22046, 67.851192],
            [20.218313, 67.851483],
            [20.214708, 67.851095],
            [20.214708, 67.851095]
          ]
        ]
      },
      "__v": 0
    },
    {
      "_id": Object("676259df559deca449386416"),
      "type": "Feature",
      "properties": {
        "centroid": {
          "type": "Point",
          "coordinates": [
            20.24623932142857,
            67.83548982142858
          ]
        },
        "color": "#663fae"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [20.154961, 67.880873],
            [20.158395, 67.877123],
            [20.158567, 67.86807],
            [20.150153, 67.859337],
            [20.142083, 67.844515],
            [20.145689, 67.833183],
            [20.154274, 67.82327],
            [20.163031, 67.813742],
            [20.182262, 67.804794],
            [20.209564, 67.803821],
            [20.232401, 67.798957],
            [20.254723, 67.801357],
            [20.279792, 67.803692],
            [20.302973, 67.802848],
            [20.30778, 67.795518],
            [20.317396, 67.791301],
            [20.329072, 67.790847],
            [20.377665, 67.817502],
            [20.369423, 67.821261],
            [20.372171, 67.824696],
            [20.381615, 67.827871],
            [20.367363, 67.85306],
            [20.334395, 67.865159],
            [20.290953, 67.869105],
            [20.209713, 67.880227],
            [20.200097, 67.880744],
            [20.193229, 67.879969],
            [20.154961, 67.880873],
            [20.154961, 67.880873]
          ]
        ]
      },
      "__v": 0
    },        
    {
      "_id": Object("67625b7fb3fe24417cfc12fa"),
      "type": "Feature",
      "properties": {
        "centroid": {
          "type": "Point",
          "coordinates": [
            20.30382190909091,
            67.84869527272727
          ]
        },
        "color": "#7ad3ac"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [20.303717, 67.848778],
            [20.303524, 67.848745],
            [20.303497, 67.848685],
            [20.303535, 67.84861],
            [20.303717, 67.848583],
            [20.304044, 67.848573],
            [20.304173, 67.848638],
            [20.304195, 67.848705],
            [20.304087, 67.848767],
            [20.303835, 67.848786],
            [20.303717, 67.848778],
            [20.303717, 67.848778]
          ]
        ]
      },
      "__v": 0
    },
    {
      "_id": Object("67625db86aa7686818747b43"),
      "type": "Feature",
      "properties": {
        "centroid": {
          "type": "Point",
          "coordinates": [
            20.297298499999997,
            67.84961736363636
          ]
        },
        "color": "#7cf494"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [20.317427, 67.847577],
            [20.319402, 67.848807],
            [20.30661, 67.853888],
            [20.304893, 67.853047],
            [20.30867, 67.850037],
            [20.306095, 67.849649],
            [20.29957, 67.853888],
            [20.295449, 67.85405],
            [20.29356, 67.85104],
            [20.290212, 67.851008],
            [20.289181, 67.854341],
            [20.273041, 67.854341],
            [20.273298, 67.853014],
            [20.276818, 67.848192],
            [20.290297, 67.848127],
            [20.293131, 67.84625],
            [20.281025, 67.843984],
            [20.282313, 67.843207],
            [20.299055, 67.846379],
            [20.306696, 67.846541],
            [20.316397, 67.846638],
            [20.317427, 67.847577],
            [20.317427, 67.847577]
          ]
        ]
      },
      "__v": 0
    },    
    
    ]);

    

    await Document.insertMany([{
      title: `Compilation of responses “So what the people of Kiruna think?” (15)`,
      stakeholders: ["Kiruna kommun", "Residents"],
      scale: "Text",
      issuance_date: "2007",
      type: "Informative Doc.",
      connections: 0,
      language: "Swedish",
      pages: "Not Specified",
      areaId: null,
      coordinates: {
        type: "Point",
        coordinates: [20.280, 67.8636]
      },
      description: `This document is a compilation of the responses to the survey 'What is your impression of Kiruna?' From the citizens' responses to this last part of the survey, it is evident that certain buildings, such as the Kiruna Church, the Hjalmar Lundbohmsgården, and the Town Hall, are considered of significant value to the population. The municipality views the experience of this survey positively, to the extent that over the years it will propose various consultation opportunities.`,
      icon_url: "/icons/informative_doc.png"
    },
    {
      title: "Detail plan for Bolagsomradet Gruvstadspark (18)",
      stakeholders: ["Kiruna kommun"],
      scale: "1 : 8.000",
      issuance_date: "2010-10-20",
      type: "Prescriptive Doc.",
      connections: 0,
      language: "Swedish",
      pages: "1-32",
      areaId: null,
      coordinates: {
        type: "Point",
        coordinates: [20.280, 67.8636]
      },
      description: `This is the first of 8 detailed plans located in the old center of Kiruna, aimed at transforming the residential areas into mining industry zones to allow the demolition of buildings. The area includes the town hall, the Ullspiran district, and the A10 highway, and it will be the first to be dismantled. The plan consists, like all detailed plans, of two documents: the area map that regulates it, and a text explaining the reasons that led to the drafting of the plan with these characteristics. The plan gained legal validity in 2012.`,
      icon_url: "/icons/prescriptive_doc.png"
    },
    {
      title: "Development Plan (41)",
      stakeholders: ["Kiruna kommun", "White Arkitekter"],
      scale: "1 : 7,500",
      issuance_date: "2014-03-17",
      type: "Design Doc.",
      connections: 0,
      language: "Swedish",
      pages: "111",
      areaId: null,
      coordinates: {
        type: "Point",
        coordinates: [20.280, 67.8636]
      },
      description: `The development plan shapes the form of the new city. The document, unlike previous competition documents, is written entirely in Swedish, which reflects the target audience: the citizens of Kiruna. The plan obviously contains many elements of the winning masterplan from the competition, some recommended by the jury, and others that were deemed appropriate to integrate later. The document is divided into four parts, with the third part, spanning 80 pages, describing the shape the new city will take and the strategies to be implemented for its relocation through plans, sections, images, diagrams, and texts. The document also includes numerous studies aimed at demonstrating the future success of the project.`,
      icon_url: "/icons/design_doc.png"
    },
    {
      title: "Deformation forecast (45)",
      stakeholders: ["LKAB"],
      scale: "1 : 12,000",
      issuance_date: "2014-12",
      type: "Technical Doc.",
      connections: 0,
      language: "Swedish",
      pages: "1",
      areaId: Object("676258a4d76298d6372c5064"),
      coordinates: {
        type: "Point",
        coordinates: [20.280, 67.8636]
      },
      description: `The development plan shapes the form of the new city. The document, unlike previous competition documents, is written entirely in Swedish, which reflects the target audience: the citizens of Kiruna. The plan obviously contains many elements of the winning masterplan from the competition, some recommended by the jury, and others that were deemed appropriate to integrate later. The document is divided into four parts, with the third part, spanning 80 pages, describing the shape the new city will take and the strategies to be implemented for its relocation through plans, sections, images, diagrams, and texts. The document also includes numerous studies aimed at demonstrating the future success of the project.`,
      icon_url: "/icons/technical_doc.png"
    },
    {
      title: "Construction of Scandic Hotel begins (63)",
      stakeholders: ["LKAB"],
      scale: "blueprints/effects",
      issuance_date: "2019-04",
      type: "Prescriptive Doc.",
      connections: 0,
      language: "Not specified",
      pages: "Not specified",
      coordinates: {
        type: "Point",
        coordinates: [20.304778, 67.848528]
      },
      description: `After two extensions of the land acquisition agreement, necessary because this document in Sweden is valid for only two years, construction of the hotel finally began in 2019.`,
      icon_url: "/icons/prescriptive_doc.png"
    },
    {
      title: "Town Hall demolition (64)",
      stakeholders: ["LKAB"],
      scale: "blueprints/effects",
      issuance_date: "2019-04",
      type: "Informative Doc.",
      connections: 0,
      language: "Not specified",
      pages: "Not specified",
      coordinates: {
        type: "Point",
        coordinates: [20.222444, 67.852500]
      },
      description: `After the construction of the new town hall was completed, the old building, nicknamed "The Igloo," was demolished. The only elements preserved were the door handles, a masterpiece of Sami art made of wood and bone, and the clock tower, which once stood on the roof of the old town hall. The clock tower was relocated to the central square of New Kiruna, in front of the new building.`,
      icon_url: "/icons/informative_doc.png"
    },
    {
      title: "Construction of Aurora Center begins (65)",
      stakeholders: ["LKAB"],
      scale: "blueprints/effects",
      issuance_date: "2019-05",
      type: "Design Doc.",
      connections: 0,
      language: "Not specified",
      pages: "Not specified",
      coordinates: {
        type: "Point",
        coordinates: [20.304389, 67.849167]
      },
      description: `Shortly after the construction of the Scandic hotel began, work on the Aurora Center also started, a multifunctional complex that includes the municipal library of Kiruna. The two buildings are close to each other and connected by a skywalk, just like in the old town center.`,
      icon_url: "/icons/design_doc.png"
    },
    {
      title: "Construction of Block 1 begins (69)",
      stakeholders: ["LKAB"],
      scale: "blueprints/effects",
      issuance_date: "2019-06",
      type: "Material effect",
      connections: 0,
      language: "Not specified",
      pages: "Not specified",
      coordinates: {
        type: "Point",
        coordinates: [20.300333, 67.848167]
      },
      description: `Simultaneously with the start of construction on the Aurora Center, work also began on Block 1, another mixed-use building overlooking the main square and the road leading to old Kiruna. These are the first residential buildings in the new town.`,
      icon_url: "/icons/default_doc.png"
    },
    {
      title: "Detail plan for square and commercial street (50)",
      stakeholders: ["Kiruna kommun"],
      scale: "1 : 1,000",
      issuance_date: "2016-06-22",
      type: "Prescriptive Doc.",
      connections: 0,
      language: "Swedish",
      pages: "1-43",
      areaId: Object("67625473d4e1e75b8fac1fd6"),
      coordinates: {
        type: "Point",
        coordinates: [20.280, 67.8636]
      },
      description: "This plan, approved in July 2016, is the first detailed plan to be implemented from the new masterplan (Adjusted development plan). The document defines the entire area near the town hall, comprising a total of 9 blocks known for their density. Among these are the 6 buildings that will face the main square. The functions are mixed, both public and private, with residential being prominent, as well as the possibility of incorporating accommodation facilities such as hotels. For all buildings in this plan, the only height limit is imposed by air traffic.",
      icon_url: "/icons/prescriptive_doc.png"
    },
    {
      title: "Gruvstadspark 2, etapp 5, Kyrkan (81)",
      stakeholders: ["Kiruna kommun"],
      scale: "1 : 2,000",
      issuance_date: "2021-09-04",
      type: "Prescriptive Doc.",
      connections: 0,
      language: "Swedish",
      pages: "1-56",
      areaId: Object("676245acadd74c13a204dfb1"),  // Sostituisci con l'area ID personalizzata, se disponibile
      coordinates: {
        type: "Point",
        coordinates: [20.280, 67.8636]  // Aggiorna con le coordinate appropriate
      },
      description: "The last detailed plan of the second planning phase concerns the area surrounding the Kiruna Church. Situated within a park, the area includes only six buildings, half of which serve religious functions. The plan also specifies that the church will be dismantled between 2025 and 2026 and reassembled at its new site by 2029.",
      icon_url: "/icons/prescriptive_doc.png"
    },

    {
      title: "Demolition documentation, Kiruna City Hall (76)",
      stakeholders: ["Norrbotten Museum"],
      scale: "text",
      issuance_date: "2020-11-26",
      type: "Informative Doc.",
      connections: 0,
      language: "Swedish",
      pages: 162,
      coordinates: {
        type: "Point",
        coordinates: [20.222444, 67.852500]
      },
      description: "This document was created to preserve the memory of the symbolic building before its demolition in April 2019. Conducted by the Norrbotten Museum, the detailed 162-page study analyzed the building's materials, both physically and chemically, taking advantage of the demolition to explore aspects that couldn't be examined while it was in use. This meticulous effort reflects a commitment to preserving knowledge of every detail of the structure.",
      icon_url: "/icons/informative_doc.png"
    },
    {
      title: "Deformation forecast (62)",
      stakeholders: ["LKAB"],
      scale: "1 : 12,000",
      issuance_date: "2019-04",
      type: "Technical Doc.",
      connections: 0,
      language: "Swedish",
      pages: "1",
      areaId: Object("67624d1ea77f36d87ba0c634"),
      coordinates: {
        type: "Point",
        coordinates: [20.300333, 67.848167]
      },
      description: `The third deformation forecast was published in 2019, five years after the second. The line has not moved; what changes, as in the previous version, are the timing of the interventions and the shape of the areas underlying the deformation zone.`,
      icon_url: "/icons/technical_doc.png"
    },
    {
      title: "Detailed plan for Gruvstaspark 2, etapp 3, del av SJ-området m m. (58)",
      stakeholders: "Kiruna kommun",
      scale: "1 : 1,500",
      issuance_date: "2018-10",
      type: "Prescriptive Doc.",
      connections: 0,
      language: "Swedish",
      pages: "1-46",
      areaId: Object("67624e2ff44609a1c739f5e2"),
      coordinates: {
        type: "Point",
        coordinates: [20.300333, 67.848167]
      },
      description: "The third Detailed Plan of the second demolition phase covers a narrow, elongated area straddling the old railway. Like all areas within the 'Gruvstaspark 2' zone, its sole designated land use is for mining activities, although it will temporarily be used as a park during an interim phase.",
      icon_url: "/icons/prescriptive_doc.png"
    },
    {
      title: "Vision 2099 (4)",
      stakeholders: ["Kiruna kommun"],
      scale: "Text",
      issuance_date: "2004",
      type: "Design Doc.",
      connections: 0,
      language: "Swedish",
      pages: "2-2",
      areaId: null, 
      coordinates: {
        type: "Point",
        coordinates: [20.301557777777777, 67.84946977777777] 
      },
      description: `Vision 2099 is to be considered the first project for the new city of Kiruna. It was created by the municipality in response to the letter from LKAB. In these few lines, all the main aspects and expectations of the municipality for the new city are condensed. The document, which despite being a project document is presented anonymously, had the strength to influence the design process. The principles it contains proved to be fundamental in subsequent planning documents.`,
      icon_url: "/icons/design_doc.png"
    },
    {
      title: "Detail plan for square and commercial street (49)",
      stakeholders: ["Kiruna kommun"],
      scale: "1 : 1,000",
      issuance_date: "2016-06-22",
      type: "Prescriptive Doc.",
      connections: 0,
      language: "Swedish",
      pages: "1-43",
      areaId: Object("67625473d4e1e75b8fac1fd6"),
      coordinates: {
        type: "Point",
        coordinates: [20.301557777777777, 67.84946977777777] // Coordinates of the area
      },
      description: `This plan, approved in July 2016, is the first detailed plan to be implemented from the new masterplan (Adjusted development plan). The document defines the entire area near the town hall, comprising a total of 9 blocks known for their density. Among these are the 6 buildings that will face the main square. The functions are mixed, both public and private, with residential being prominent, as well as the possibility of incorporating accommodation facilities such as hotels. For all buildings in this plan, the only height limit is imposed by air traffic.`,
      icon_url: "/icons/prescriptive_doc.png"
    },
    {
      title: "Construction of new city hall begins (48)",
      stakeholders: ["LKAB"],
      scale: "blueprints/effects",
      issuance_date: "2015",
      type: "Material effect",
      connections: 0,
      language: "-",
      pages: "-",
      coordinates: {
        type: "Point",
        coordinates: [20.30310, 67.84855] // Coordinates converted from 67°84'88.97"N 20°30'29.16"E
      },
      description: `The Kiruna Town Hall was the first building to be rebuilt in the new town center in 2015. It remained isolated for quite some time due to a slowdown in mining activities.`,
      icon_url: "/icons/default_doc.png"
    },
    {
      title: "Adjusted development plan (47)",
      stakeholders: ["Kiruna kommun", "White Arkitekter"],
      scale: "1 : 7,500",
      issuance_date: "2015",
      type: "Design Doc.",
      connections: 0,
      language: "Swedish",
      pages: "1",
      areaId: Object("676257d24ec519174223edd3"), // Replace with the appropriate ObjectId for the area
      coordinates: {
        type: "Point",
        coordinates: [20.292364357142862, 67.85180507142857] // Example coordinates
      },
      description: `This document is the update of the Development Plan, one year after its creation, modifications are made to the general master plan, which is published under the name 'Adjusted Development Plan91,' and still represents the version used today after 10 years. Certainly, there are no drastic differences compared to the previous plan, but upon careful comparison, several modified elements stand out. For example, the central square now takes its final shape, as well as the large school complex just north of it, which appears for the first time.`,
      icon_url: "/icons/design_doc.png" // You can modify the icon URL as per your need
    },
    {
      title: "Detailed Overview Plan for the Central Area of Kiruna 2014. (44)",
      stakeholders: ["Kiruna kommun"],
      scale: "1 : 30,000",
      issuance_date: "2014-06",
      type: "Prescriptive Doc.",
      connections: 0,
      language: "Swedish",
      pages: "18-136-3-1",
      areaId: Object("676259df559deca449386416"), // Replace with the appropriate ObjectId for the area
      coordinates: {
        type: "Point",
        coordinates: [20.30382190909091, 67.84869527272727]
      },
      description: "The Detailed Overview Plan is one of the three planning instruments available to Swedish administrations and represents an intermediate scale. Like the Overview Plan, compliance with it is not mandatory, but it serves as a supporting plan for Detailed Plans, sharing the characteristic of regulating a specific area of the Kiruna municipality rather than its entire extent, as the Overview Plan does. This specific plan focuses on the central area of Kiruna and its surroundings, incorporating all the projections of the Development Plan into a prescriptive tool.",
      icon_url: "/icons/prescriptive_doc.png"
    },
    {
      title: "Detailed plan for LINBANAN 1. (42)",
      stakeholders: ["Kiruna kommun"],
      scale: "1 : 500",
      issuance_date: "2014-03",
      type: "Prescriptive Doc.",
      connections: 0,
      language: "Swedish",
      pages: "1-15",
      areaId: Object("67625b7fb3fe24417cfc12fa"),
      coordinates: {
        type: "Point",
        coordinates: [20.30382190909091, 67.84869527272727]
      },
      description: "This is the first Detailed Plan for the new city center, covering a very small area. It regulates the use of a portion of land that will host a single building. Its boundaries coincide with the outer footprint of the new Town Hall, 'Kristallen,' the first building to be constructed in the new Kiruna.",
      icon_url: "/icons/prescriptive_doc.png"
    },
    
    {
      title: "Development Plan (41)",
      stakeholders: ["Kiruna kommun", "White Arkitekter"],
      scale: "1 : 7,500",
      issuance_date: "2014-03-17",
      type: "Design Doc.",
      connections: 0,
      language: "Swedish",
      pages: 111,
      areaId: Object("67625db86aa7686818747b43"),
      coordinates: {
        type: "Point",
        coordinates: [20.30382190909091, 67.84869527272727]
      },
      description: "The development plan shapes the form of the new city. The document, unlike previous competition documents, is written entirely in Swedish, which reflects the target audience: the citizens of Kiruna. The plan obviously contains many elements of the winning masterplan from the competition, some recommended by the jury, and others that were deemed appropriate to integrate later. The document is divided into four parts, with the third part, spanning 80 pages, describing the shape the new city will take and the strategies to be implemented for its relocation through plans, sections, images, diagrams, and texts. The document also includes numerous studies aimed at demonstrating the future success of the project.",
      icon_url: "/icons/design_doc.png"
    },

    {
      title: "Mail to Kiruna kommun (2)",
      stakeholders: ["LKAB"],
      scale: "Text",
      issuance_date: "2004-03-19",
      type: "Prescriptive Doc.",
      connections: 0,
      language: "Swedish",
      pages: 1,
      areaId: null,
      coordinates: {
        type: "Point",
        coordinates: [20.30382190909091, 67.84869527272727]
      },
      description: "This document is considered the act that initiates the process of relocating Kiruna. The company communicates its intention to construct a new mining level at a depth of 1,365 meters. Along with this, LKAB urges the municipality to begin the necessary planning to relocate the city, referring to a series of meetings held in previous months between the two stakeholders.",
      icon_url: "/icons/prescriptive_doc.png"
    },
    {
      title: "Detail plan for Bolagsomradet Gruvstad- spark (18)",
      stakeholders: ["Kiruna kommun"],
      scale: "1 : 8.000",
      issuance_date: "2010-10-20",
      type: "Prescriptive Doc.",
      connections: 8,
      language: "Swedish",
      pages: "1-32",
      areaId: Object("67625b7fb3fe24417cfc12fa"),
      coordinates: {
        type: "Point",
        coordinates: [20.30382190909091, 67.84869527272727]
      },
      description: "This is the first of 8 detailed plans located in the old center of Kiruna, aimed at transforming the residential areas into mining industry zones to allow the demolition of buildings. The area includes the town hall, the Ullspiran district, and the A10 highway, and it will be the first to be dismantled. The plan consists, like all detailed plans, of two documents: the area map that regulates it, and a text explaining the reasons that led to the drafting of the plan with these characteristics. The plan gained legal validity in 2012.",
      icon_url: "/icons/prescriptive_doc.png"
    },
    {
      title: "Kiruna Church closes (102)",
      stakeholders: ["LKAB"],
      scale: "blueprints/effects",
      issuance_date: "2024-06-02",
      type: "Material effect",
      connections: 2,
      language: "Swedish",
      pages: "-",
      coordinates: {
        type: "Point",
        coordinates: [20.23289, 67.85237]
      },
      description: "On June 2, the Kiruna Church was closed to begin the necessary preparations for its relocation, following a solemn ceremony. The relocation is scheduled for the summer of 2025 and will take two days. Both the new site and the route for the move have already been determined. A significant period will pass between the relocation and the reopening of the church, voted 'Sweden's most beautiful building constructed before 1950.'",
      icon_url: "/icons/prescriptive_doc.png"
    }
    
    
    


    ]);

    console.log('Database populated successfully');
  } catch (error) {
    console.error('Error populating the database:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createDatabase();