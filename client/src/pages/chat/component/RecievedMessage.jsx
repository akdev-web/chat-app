import React, { useState } from 'react'
import DateStringtoLocalTime from '../util/DateStringtoLocalTime';
import ChatImage from './ChatImage';

const RecievedMessage = ({msg}) => {
    return (
        <div
            className={`max-w-[70%] flex-col flex my-10
                }`}
        >
            {
                msg.images &&
                msg.images.map((img,i) => (
                    <div key={i} className='mb-2.5 p-3 rounded-2xl bg-[var(--msg-receiver)] text-right shadow'>
                        {img.file && 
                        <>
                            <ChatImage file={img} />
                        </>}
                        <p className='text-sm text-[var(---color-text-xlight)]'>{img.filename}</p>
                    </div>
                ))
            }
            {
                msg.prog &&
                <div className='p-3 rounded-2xl bg-[var(--msg-sender)] text-right  rounded-tr-none shadow'>
                    <p>{msg.prog.msg} : {msg.prog.state} : {msg.prog.progress}</p>
                </div>
            }
            <div className="flex justify-end items-center text-xs p-1">
                {msg.from && <p className=" text-[var-text-xlight] mr-2.5">{msg.from.username}</p>}
                {msg.timestamp && <p className='text-[var-text-xlight] mr-2.5'>{DateStringtoLocalTime(msg.timestamp)}</p>}
            </div>
            {msg.text.length > 0 &&
                    <p className={`p-3 rounded-2xl bg-[var(--msg-receiver)] text-right  rounded-tr-none shadow 
                        ${msg.state === 'deleted' && 'bg-gray-300 text-gray-700 italic text-sm border border-dashed border-gray-300 '}`}>
                        {msg.text}
                    </p>
            }
        </div>
    )
}

export default RecievedMessage