import React, { useContext } from 'react';
import { DocumentContext } from '../contexts/DocumentContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckDouble, faLayerGroup } from '@fortawesome/free-solid-svg-icons';
import styles from './Map.module.css';
import style from './SelectDocumentsButton.module.css';
import CloseModeSelectionButton from './CloseModeSelectionButton';
import { PiBroom } from "react-icons/pi";

const SelectDocumentsButton = () => {
    const { setSelectedDocs, selectingMode, setSelectingMode, showUnion, setShowUnion } = useContext(DocumentContext);

    return (
        <>
        {!selectingMode && !showUnion &&
            <button
                className={`${styles.selectDocumentsButton}`}
                onClick={() => {
                                setSelectedDocs([]);
                                setSelectingMode(true);
                                setShowUnion(false);
                            }}
            >
                <FontAwesomeIcon icon={faLayerGroup} />
            </button>
        }

        {!selectingMode && showUnion &&
            <button
                className={`${styles.selectDocumentsButton}`}
                onClick={() => {
                                setSelectedDocs([]);
                                setSelectingMode(false);
                                setShowUnion(false);
                            }}
            >
                <PiBroom />
            </button>
        }

        { 
            selectingMode && (
                    <div className={`${style.background} ${style.expanded}` }>
                        <div className={style.verticalAlignment}>
                            <div style={{ height: '55px' }}>
                                <p>Confirm selections {" "}
                                    <button className={style.buttonLink} onClick={() => {setSelectingMode(false); setShowUnion(true);}}>     
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
                                onClick={() => { setSelectedDocs([]); setSelectingMode(false); setShowUnion(false);}}
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

