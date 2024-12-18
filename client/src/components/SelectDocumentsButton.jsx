import React, { useContext } from 'react';
import { DocumentContext } from '../contexts/DocumentContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckDouble, faLayerGroup } from '@fortawesome/free-solid-svg-icons';
import styles from './Map.module.css';
import style from './SelectDocumentsButton.module.css';
import CloseModeSelectionButton from './CloseModeSelectionButton';

const SelectDocumentsButton = () => {
    const { selectedDocs, setSelectedDocs, selectingMode, setSelectingMode } = useContext(DocumentContext);

    return (
        <>
        {!selectingMode &&
            <button
                className={`${styles.selectDocumentsButton}`}
                onClick={() => {
                                setSelectingMode(prev => !prev);
                                console.log(selectedDocs);
                            }}
            >
                <FontAwesomeIcon icon={faLayerGroup} />
            </button>
        }

        { 
            selectingMode && (
                    <div className={`${style.background} ${style.expanded}` }>
                        <div className={style.verticalAlignment}>
                            <div style={{ height: '55px' }}>
                                <p>Confirm selections {" "}
                                    <button className={style.buttonLink} onClick={() => {setSelectedDocs([]); setSelectingMode(prev => !prev); console.log("TO IMPLEMENT VISUALIZATION OF THE AREA OF SELECTED DOCS: ", selectedDocs);}}>     
                                        <FontAwesomeIcon icon={faCheckDouble} />
                                    </button>
                                </p>
                            </div>
                            {/* Close button - always rendered */}
                            <div>
                                <p>
                                    Back {" "}
                            <CloseModeSelectionButton
                                isVisible={selectingMode}
                                onClick={() => { setSelectedDocs([]); setSelectingMode(prev => !prev); }}
                            />
                                </p>
                            </div>
                        </div>
                    </div>
            )
        }
        </>
    );
}

export default SelectDocumentsButton;

