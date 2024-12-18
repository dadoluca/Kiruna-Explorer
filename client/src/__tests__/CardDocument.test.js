import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CardDocument from '../components/CardDocument';
import { DocumentContext } from '../contexts/DocumentContext';
import { AuthContext } from '../contexts/AuthContext';

const mockSetVisualizeDiagram = jest.fn();
const mockSetHighlightedNode = jest.fn();
const mockOnChangeCoordinates = jest.fn();
const mockOnToggleSelecting = jest.fn();

describe('CardDocument Component', () => {
  const mockDocument = {
    _id: '123',
    title: 'Test Document',
    description: 'Test Description',
    stakeholders: ['User1'],
    scale: 'Large',
    issuance_date: '2024-01-01',
    type: 'Plan',
    connections: 3,
    relationships: [],
    language: 'English',
    pages: 10,
  };

  const renderComponent = (
    visualizeDiagram = false,
    loggedIn = true
  ) => {
    render(
      <AuthContext.Provider value={{ loggedIn }}>
        <DocumentContext.Provider
          value={{
            visualizeDiagram,
            setVisualizeDiagram: mockSetVisualizeDiagram,
            setHighlightedNode: mockSetHighlightedNode,
            documents: [mockDocument],
            checkDocumentPresence: () => false,
          }}
        >
          <CardDocument
            doc={mockDocument}
            onClose={jest.fn()}
            onChangeCoordinates={mockOnChangeCoordinates}
            onToggleSelecting={mockOnToggleSelecting}
            isListing={false}
          />
        </DocumentContext.Provider>
      </AuthContext.Provider>
    );
  };

  // ----- KX14 Tests -----
  test('KX14: renders "Show on diagram" button when visualizeDiagram is false', async () => {
    renderComponent(false);

    await waitFor(() => {
      const button = screen.getByRole('button', { name: /show on diagram/i });
      expect(button).toBeInTheDocument();
    });
  });

  test('KX14: does not render "Show on diagram" button when visualizeDiagram is true', async () => {
    renderComponent(true);

    await waitFor(() => {
      const button = screen.queryByRole('button', { name: /show on diagram/i });
      expect(button).not.toBeInTheDocument();
    });
  });

  test('KX14: calls setVisualizeDiagram and setHighlightedNode when "Show on diagram" button is clicked', async () => {
    renderComponent(false);

    const button = screen.getByRole('button', { name: /show on diagram/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockSetVisualizeDiagram).toHaveBeenCalledWith(true);
      expect(mockSetHighlightedNode).toHaveBeenCalledWith(mockDocument._id);
    });
  });

  // ----- KX17 Test -----
  test('KX17: highlights the document node when selected on the map', async () => {
    renderComponent(true);

    await waitFor(() => {
      const button = screen.queryByRole('button', { name: /show on diagram/i });
      expect(button).not.toBeInTheDocument();
      expect(mockSetHighlightedNode).toHaveBeenCalledWith(mockDocument._id);
    });
  });

  // ----- KX11 Tests -----
  test('KX11: renders "Change coordinates" button when user is logged in', async () => {
    renderComponent(false, true);

    await waitFor(() => {
      const button = screen.getByRole('button', { name: /change coordinates/i });
      expect(button).toBeInTheDocument();
    });
  });

  test('KX11: does not render "Change coordinates" button when user is not logged in', async () => {
    renderComponent(false, false);

    await waitFor(() => {
      const button = screen.queryByRole('button', { name: /change coordinates/i });
      expect(button).not.toBeInTheDocument();
    });
  });

  test('KX11: calls onChangeCoordinates and onToggleSelecting when "Change coordinates" button is clicked', async () => {
    renderComponent(false, true);

    const button = screen.getByRole('button', { name: /change coordinates/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockOnChangeCoordinates).toHaveBeenCalledWith(mockDocument);
      expect(mockOnToggleSelecting).toHaveBeenCalledWith(true);
    });
  });
});
