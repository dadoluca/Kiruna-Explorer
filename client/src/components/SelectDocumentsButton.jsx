import React, { useState, useContext } from 'react';
import { useMapEvents } from 'react-leaflet';
import { AuthContext } from '../contexts/AuthContext';
import { DocumentContext } from '../contexts/DocumentContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faCirclePlus, faHouseChimney, faMapMarker, faPlus, faSquarePlus } from '@fortawesome/free-solid-svg-icons';
import styles from './Map.module.css';
import styl from './SelectDocumentsButton.module.css';
import { SelectionState } from './SelectionState';
import CloseModeSelectionButton from './CloseModeSelectionButton';
import PropTypes from 'prop-types';

const SelectDocumentsButton = () => {
    const { selectedDocs, setSelectedDocs, selectingMode, setSelectingMode } = useContext(DocumentContext);

    return (
        <>
            <button
                className={`${styles.selectDocumentsButton}`}
                onClick={() => {
                                setSelectingMode(prev => !prev);
                                console.log(selectedDocs);
                            }}
        >
                            {
                                !selectingMode && <i class="bi bi-files"></i>
                            }
                            {
                                selectingMode && <i class="bi bi-send"></i>
                            }
            </button>
                

                    {
                        selectingMode &&
                        <button
                        className={`${styles.selectDocumentsButton}`}
                        onClick={() => {
                            setSelectedDocs([]);
                            setSelectingMode(prev => !prev);
                        }}
                         >
                            <i class="bi bi-x"></i>
                        </button>
                    }
        </>
    );
}

export default SelectDocumentsButton;

