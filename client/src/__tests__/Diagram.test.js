import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Diagram from '../components/Diagram';
import { DocumentContext } from '../contexts/DocumentContext';
import API from '../services/api';
import '@testing-library/jest-dom';
import * as d3 from 'd3';

// Mocking d3
jest.mock('d3', () => ({
  select: jest.fn(() => ({
    selectAll: jest.fn(() => ({
      remove: jest.fn(),
    })),
    append: jest.fn(() => ({
      attr: jest.fn(() => ({
        attr: jest.fn(() => ({
          attr: jest.fn(),
        })),
      })),
      style: jest.fn(() => ({
        style: jest.fn(),
      })),
      call: jest.fn(() => ({
        call: jest.fn(),
      })),
    })),
    attr: jest.fn(() => ({
      attr: jest.fn(),
    })),
    call: jest.fn(),
  })),
  axisTop: jest.fn(() => ({
    tickValues: jest.fn(() => ({
      tickFormat: jest.fn(),
    })),
  })),
  axisLeft: jest.fn(() => ({
    tickValues: jest.fn(() => ({
      tickFormat: jest.fn(),
    })),
  })),
  scaleLinear: jest.fn(() => ({
    domain: jest.fn(() => ({
      range: jest.fn(),
    })),
  })),
  format: jest.fn(() => jest.fn()),
}));

describe('Diagram Component', () => {
  const mockDocuments = [
    { id: 'doc1', title: 'Test Document 1', diagramX: 100, diagramY: 100 },
    { id: 'doc2', title: 'Test Document 2', diagramX: 200, diagramY: 200 },
  ];

  const updateDocument = jest.fn();

  const renderDiagram = () => {
    render(
      <DocumentContext.Provider
        value={{
          documents: mockDocuments,
          updateDocument,
        }}
      >
        <Diagram />
      </DocumentContext.Provider>
    );
  };

  test('DocumentContext is passed correctly', () => {
    renderDiagram();

    expect(screen.getByText('Test Document 1')).toBeInTheDocument();
  });

  test('renders diagram with nodes', () => {
    renderDiagram();

    const nodes = screen.getAllByRole('img');
    expect(nodes).toHaveLength(mockDocuments.length);
  });

  test('dragging a node updates its position', async () => {
    renderDiagram();

    API.setDocumentDiagramPosition = jest.fn().mockResolvedValue({
      _id: 'doc1',
      diagramX: 150,
      diagramY: 150,
    });

    const firstNode = screen.getAllByRole('img')[0];

    act(() => {
      fireEvent.mouseDown(firstNode, { clientX: 100, clientY: 100 });
      fireEvent.mouseMove(firstNode, { clientX: 150, clientY: 150 });
      fireEvent.mouseUp(firstNode);
    });

    await act(async () => {
      expect(API.setDocumentDiagramPosition).toHaveBeenCalledWith('doc1', 150, 150);
    });
  });

  test('savePositions function triggers API call for modified nodes', async () => {
    renderDiagram();

    API.setDocumentDiagramPosition = jest.fn().mockResolvedValue({
      _id: 'doc1',
      diagramX: 150,
      diagramY: 150,
    });

    const saveButton = screen.getByRole('button', { name: /save positions/i });
    fireEvent.click(saveButton);

    await act(async () => {
      expect(API.setDocumentDiagramPosition).toHaveBeenCalledTimes(1);
      expect(API.setDocumentDiagramPosition).toHaveBeenCalledWith('doc1', 150, 150);
    });
  });
});
