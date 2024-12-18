import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { DocumentContext } from '../contexts/DocumentContext';
import SelectDocumentsButton from '../components/SelectDocumentsButton';

describe('SelectDocumentsButton', () => {
  it('should toggle selecting mode when button is clicked', () => {
    // Mock context values
    const mockSetSelectingMode = jest.fn();
    const mockSetSelectedDocs = jest.fn();
    const selectedDocs = []; // selected docs is empty initially

    // Render component within context provider
    render(
      <DocumentContext.Provider
        value={{
          selectedDocs,
          setSelectedDocs: mockSetSelectedDocs,
          selectingMode: false, // Initially not in selecting mode
          setSelectingMode: mockSetSelectingMode, // Pass mock function
        }}
      >
        <SelectDocumentsButton />
      </DocumentContext.Provider>
    );

    // Step 1: Find the button by its role (since it's a button, no need to search by text)
    const selectButton = screen.getByRole('button');
    expect(selectButton).toBeInTheDocument(); // Check that the button is in the document

    // Step 2: Simulate a click on the button
    fireEvent.click(selectButton);

    // Step 3: Check if the setSelectingMode function was called with 'true'
    expect(mockSetSelectingMode).toHaveBeenCalledTimes(1); // Check that the function was called exactly once
    expect(mockSetSelectingMode).toHaveBeenCalledWith(expect.any(Function)); // Ensure the function was called with a function (since it's a toggle)
  });
});
