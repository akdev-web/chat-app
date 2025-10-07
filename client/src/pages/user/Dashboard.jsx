import React, { useEffect, useState } from 'react'
import { useReducer } from 'react';
import QuizForm from '../quiz/components/QuizForm';
import api from '../../components/api';
import QuizCard from '../quiz/components/QuizCard';
import QuizCardDash from './components/QuizCardDash';

const Dashboard = () => {
 
  const initialSate = {
    createNew: false,
    message: null
  }

  const manageFunc = (state, action) => {
    switch (action.field) {
      case 'create':
        return { ...state, createNew: action.value };
      case 'msg':
        return { ...state, message: action.value };
      default:
        return state;
    }

  }

  const [manage, manager] = useReducer(manageFunc, initialSate)
  const [edit,setEdit] = useState(null);
  const [myQuiz,setMyquiz] = useState([])

  console.log(myQuiz)
  useEffect(()=>{
    const get_quizes = async() =>{
      try {
        const res = await api.get('/dashboard/quiz');
        if(res.data.success){
          let quizresult =res.data?.data;
          if(quizresult) setMyquiz(quizresult);
        }
      } catch (err) {
        if(err.response?.data){
          manager({type:'msg',value:{type:'err',msg:err.response.data.err}});
        }
        console.log(err);
      }
    }


    get_quizes();
  },[])

 

  return (
    <div>
      {
        edit ?
        <QuizForm edit={edit} setEdit={setEdit} manage={manage} manager={manager}/>
        :
        <QuizForm manage={manage} manager={manager}/>
      }
      <div className='mt-10 grid gap-4 grid-cols-1  lg:grid-cols-2  xl:grid-cols-3'>
        {
          myQuiz.map((quiz)=>{
            return <QuizCardDash key={quiz.quizId} quiz={quiz.quiz} totalParticipants={quiz.totalParticipants} topParticipants={quiz.topParticipants} edit={setEdit}/>
          })
        }
      </div>
    </div>
  )
}

export default Dashboard;