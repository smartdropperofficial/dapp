// messageInputBoxStyles.js
import { CSSProperties } from 'react';

export const messageInputBoxStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderTop: '1px solid #ddd',
    // position: 'fixed' as 'fixed', // Cast di tipo
    bottom: 0,
    width: '100%',
    height: '100%'

};

export const inputStyle: CSSProperties = {

    border: 'none',
    padding: '10px',
    marginRight: '10px',
    borderRadius: '20px',
    backgroundColor: '#e9ecef',
    height: '50px'

};

export const buttonStyle: CSSProperties = {
    padding: '10px 20px',
    borderRadius: '20px',
};

export const messageInputContainerStyle: CSSProperties = {
    // position: 'absolute' as 'absolute', // Cast di tipo
    width: '100%',
    padding: '10px',
    backgroundColor: 'white',
    height: '100%',
    display: 'flex',
    alignItems: 'end'

};
