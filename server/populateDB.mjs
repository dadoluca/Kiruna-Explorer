import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Area from './models/Geolocation.mjs';
import Document from './models/Document.mjs';

dotenv.config();

const uri = process.env.MONGO_URI;

async function createDatabase() {
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

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
      issuance_date: "20/10/2010",
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
      issuance_date: "17/03/2014",
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
      issuance_date: "12/2014",
      type: "Technical Doc.",
      connections: 0,
      language: "Swedish",
      pages: "1",
      areaId: null,
      coordinates: {
        type: "Point",
        coordinates: [20.280, 67.8636]
      },
      description: `The development plan shapes the form of the new city. The document, unlike previous competition documents, is written entirely in Swedish, which reflects the target audience: the citizens of Kiruna. The plan obviously contains many elements of the winning masterplan from the competition, some recommended by the jury, and others that were deemed appropriate to integrate later. The document is divided into four parts, with the third part, spanning 80 pages, describing the shape the new city will take and the strategies to be implemented for its relocation through plans, sections, images, diagrams, and texts. The document also includes numerous studies aimed at demonstrating the future success of the project.`,
      icon_url: "/icons/technical_doc.png"
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
      areaId: null,
      coordinates: {
        type: "Point",
        coordinates: [20.280, 67.8636]
      },
      description: `This document is the update of the Development Plan, one year after its creation, modifications are made to the general master plan, which is published under the name 'Adjusted Development Plan91,' and still represents the version used today after 10 years. Certainly, there are no drastic differences compared to the previous plan, but upon careful comparison, several modified elements stand out. For example, the central square now takes its final shape, as well as the large school complex just north of it, which appears for the first time.`,
      icon_url: "/icons/design_doc.png"
    },
    {
      title: "Construction of Scandic Hotel begins (63)",
      stakeholders: ["LKAB"],
      scale: "blueprints/effects",
      issuance_date: "04/2019",
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
      issuance_date: "04/2019",
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
      issuance_date: "05/2019",
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
      issuance_date: "06/2019",
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
      issuance_date: "22/06/2016",
      type: "Prescriptive Doc.",
      connections: 0,
      language: "Swedish",
      pages: "1-43",
      areaId: null,
      coordinates: {
        type: "Point",
        coordinates: [20.280, 67.8636]
      },
      description: "This plan, approved in July 2016, is the first detailed plan to be implemented from the new masterplan (Adjusted development plan). The document defines the entire area near the town hall, comprising a total of 9 blocks known for their density. Among these are the 6 buildings that will face the main square. The functions are mixed, both public and private, with residential being prominent, as well as the possibility of incorporating accommodation facilities such as hotels. For all buildings in this plan, the only height limit is imposed by air traffic.",
      icon_url: "/icons/prescriptive_doc.png"
    }]);

    console.log('Database populated successfully');
  } catch (error) {
    console.error('Error populating the database:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createDatabase();