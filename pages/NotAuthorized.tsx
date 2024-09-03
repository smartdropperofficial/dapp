import Card from '@/components/UI/Card'
import { grey } from '@mui/material/colors'
import React from 'react'

function NotAuthorized() {
    return (
        <div className="container d-flex justify-content-center w-100">
            <div className='card w-50 '>
                <h2 style={{ color: '#c2c2c2' }} className='text-center'><b>401</b> Not Authorized</h2>
            </div>
        </div>

    )
}

export default NotAuthorized