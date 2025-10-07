import React, { useState } from 'react'
import { GoDot, GoDotFill } from 'react-icons/go';
import DateStringtoLocalTime from '../util/DateStringtoLocalTime';
import ChatImage from './ChatImage';
import { motion } from 'framer-motion';
import { RotateCcw, Trash2 } from 'lucide-react';

const SentMessage = ({ msg, isPersonal, onDelete, onRetry }) => {
    const [showDelete, setShowDelete] = useState({ dragged: false, clicked: false })

    return (
        <div
            className={`relative`}
        >
            <motion.div
                className='flex items-center relative'
                drag={msg.state === 'deleted' ? false : 'x'} dragConstraints={{ left: -60, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(e, info) => {
                    if (info.offset.x < 5) setShowDelete(prev => ({ ...prev, clicked: !prev.clicked }))
                    if (info.offset.x < -40) { setShowDelete(prev => ({ clicked:false, dragged: true })) }
                    else setShowDelete(prev => ({ clicked:false, dragged: false }))
                }}
            >
                <div className='max-w-[70%]  flex-col flex my-10  ml-auto '
                    onClick={()=> !msg.state === 'deleted' && setShowDelete(prev => ({ ...prev, clicked: !prev.clicked }))}
                >
                    
                {
                    (msg.images && msg.images.length > 0) &&
                    msg.images.map((img, i) => (
                        <div key={i} className='mb-2.5 p-3 rounded-2xl bg-[var(--msg-sender)] text-right  rounded-tr-none shadow'>
                            {img.file &&
                                <ChatImage file={img} />
                            }
                            {
                                img.preview &&
                                <img src={img.preview} alt={img.filename}  />
                            }
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
                {msg.text &&
                    <p className={`p-3 rounded-2xl bg-[var(--msg-sender)] text-right  rounded-tr-none shadow 
                        ${msg.state === 'deleted' && 'bg-gray-300 text-gray-700 italic text-sm border border-dashed border-gray-300'}`}>
                        {msg.text}
                    </p>
                }
                <div className="flex justify-end items-center text-xs mr-2.5 p-1">
                    {msg.from && <p className=" text-[var-text-xlight] mr-2.5">{msg.from.username}</p>}
                    {msg.timestamp && <p className=' text-[var-text-xlight] mr-2.5'>{DateStringtoLocalTime(msg.timestamp)}</p>}
                    {
                        (isPersonal) &&
                        <div>{
                            msg.state === 'retryable' ? 
                            <div className='cursor-pointer inline-flex gap-1 text-red-500
                                ' onClick={()=>onRetry({retry:msg})}>
                                <RotateCcw size={16} /> Retry 
                            </div>:
                            msg.state === 'read' ?
                                <div className="flex ">
                                    <GoDotFill />
                                    <GoDotFill />
                                </div>
                                :
                                msg.state === 'delivered' ?
                                    <div className="flex ">
                                        <GoDot />
                                        <GoDot />
                                    </div> 
                                : 
                                msg.state === 'sent' ? <GoDot />
                                : <span className={`${msg.state === 'failed' && 'text-red-500'}`}>{msg.state}</span>
                        }</div>
                    }
                </div>
                </div>

                {(showDelete.dragged || showDelete.clicked) && (
                    <button
                        disabled={msg.state === 'deleted'}
                        onClick={() => msg.state !== 'deleted' && onDelete(msg.msgId) }
                        className={` ${ showDelete.clicked ? 'top-[80px] right-[20px]' : 
                            showDelete.dragged && 'top-1/2 -right-12 -translate-y-1/2'}
                            transition-transform duration-200 hover:scale-75
                            absolute bg-red-500 hover:bg-red-600 p-2 rounded-full shadow-lg `}
                        
                    >
                        <Trash2 className="w-5 h-5 text-white" size={52}/>
                    </button>
                )}
            </motion.div>
        </div>
    )
}

export default SentMessage