import mongoose from 'mongoose';
import Document from '../models/Document.mjs';

export const addBidirectionalRelationship = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params; // Document A
    const { documentId: relatedDocumentId, type, title } = req.body; // Document B

    // Ensure both documents exist
    const [docA, docB] = await Promise.all([
      Document.findById(id).session(session),
      Document.findById(relatedDocumentId).session(session)
    ]);

    if (!docA || !docB) {
      throw new Error('One or both documents not found');
    }

    // Add relationship to Document A
    docA.relationships.push({ documentId: relatedDocumentId, documentTitle: title, type });
    await docA.save({ session });

    // Add reverse relationship to Document B
    docB.relationships.push({ documentId: id, documentTitle: docA.title, type });
    await docB.save({ session });

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ success: true, message: 'Bidirectional relationship added successfully' });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ success: false, message: error.message });
  }
};
