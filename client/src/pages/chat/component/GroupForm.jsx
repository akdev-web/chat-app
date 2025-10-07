import React from 'react'
import { useReducer } from 'react'
import { chat } from '../../../components/api'
import { useState } from 'react'

const GroupForm = ({ group = null, setEdit = null }) => {
    let initialForm = {
        groupName: '',
        groupDesc: '',
        groupPrivacy: 'private',
    }

    if (group) {
        let { members, isAdmin,profile, ...init } = group;
        initialForm = { ...initialForm, ...init }
    }
    const formReducer = (state, action) => {
        switch (action.type) {
            case 'set':
                return { ...state, [action.field]: action.value }
            case 'reset':
                return initialForm
            default:
                return state;
        }
    }
    const [form, setForm] = useReducer(formReducer, initialForm)
    const [response,setResponse] = useState({ type: null, text: '' },)
    console.log(form);
    const handleSubmit = async (e) => {
        setResponse( { type: null, text: '' } );
        e.preventDefault();
        if (form.groupName.length < 3) {
            return setResponse({type: 'err', text: 'Group Name should atleast contains 3 charcters' });
        } else if (!['public', 'private'].includes(form.groupPrivacy)) {
            return setResponse({ type: 'err', text: 'Please Select a Group Privacy' });
        }

        try {
            const res = await chat.post('/group/new', form);
            if (res.data.success) {
                const data = res.data;
                setResponse({ type: 'success', text: data.msg });
            }
        } catch (error) {
            console.log(error);
        }
        console.log('form submittted', "form data :", form);
        setResponse({ type: 'success', text: 'form submitted' });
    }
    return (
        <>
            <form onSubmit={setEdit ? setEdit :handleSubmit} className='flex flex-col w-full gap-2.5 px-4 py-2'>
                {
                    response?.type &&
                    <p className={`px-4 py-2 ${response.type === 'err' ? 'bg-[var(--color-error-bg)] text-[var(--color-error-text)]' : 'bg-[var(--color-success-bg)] text-[var(--color-success-text)]'}  text-sm`}>

                        {response.text}
                    </p>
                }
                <input value={form.groupName} onChange={(e) => setForm({ type: 'set', field: e.target.name, value: e.target.value })}
                    className="px-2.5 py-1.5  placeholder-[var(---color-placeholder)]  border-[var(---color-input-border)] focus:border-[var(---color-input-b-focus)]  outline-none focus:outline-0 border-2 transition-colors duration-300" type="text" name="groupName" placeholder='Enter Group Name' />
                <textarea value={form.groupDesc} onChange={(e) => setForm({ type: 'set', field: e.target.name, value: e.target.value })} name="groupDesc" rows={4} placeholder='Enter Group Description'
                    className="px-2.5 py-1.5  placeholder-[var(---color-placeholder)]  border-[var(---color-input-border)] focus:border-[var(---color-input-b-focus)]  outline-none focus:outline-0 border-2 transition-colors duration-300 resize-none">

                </textarea>
                <div>
                    <p className='font-semibold'>Group Privacy</p>
                    <div className='flex gap-4'>
                        <div className='flex gap-2 items-center'>
                            <input onChange={(e) => setForm({ type: 'set', field: e.target.name, value: e.target.value })}
                                type="radio" name="groupPrivacy" value="public" checked={form.groupPrivacy === 'public'} />
                            Public
                        </div>
                        <div className='flex gap-2 items-center'>
                            <input onChange={(e) => setForm({ type: 'set', field: e.target.name, value: e.target.value })}
                                type="radio" name="groupPrivacy" value="private" checked={form.groupPrivacy === 'private'} />
                            Priavte
                        </div>
                    </div>
                </div>
                <button type="button" className='w-max ml-auto bg-black text-white rounded-lg px-4 py-1.5 font-medium text-xl cursor-pointer'
                    onClick={() => { setForm({ type: 'reset' }) }}>
                    Reset
                </button>
                <button className='bg-black text-white rounded-lg py-2 font-medium text-xl cursor-pointer' type='submit'>
                    {group ? 'Save Changes' : 'Create'}
                </button>
            </form>
        </>
    )
}

export default GroupForm