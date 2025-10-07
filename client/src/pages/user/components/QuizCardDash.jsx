import { FilePen, Trash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GetTime from '../../../components/util/DurationToTIme';

const QuizCardDash = ({ quiz, totalParticipants, topParticipants, edit, deleteQuiz }) => {
    const { title, description, timer, category, quizId, createdBy } = quiz;

    const navigate = useNavigate();
    // Utility function to trim by word count
    const trimmed = (text, limit) => {
        const words = text.trim().split(/\s+/);
        if (words.length <= limit) return text;
        return words.slice(0, limit).join(" ") + " ...";
    };

    return (
        <div className=' rounded-lg overflow-hidden bg-[var(---color-bg)]'>
            <div className='flex  gap-2 '>
                <div className="thumnail w-full h-[400px] max-h-72 overflow-hidden"
                    style={{
                        backgroundImage: `url(/quiz_thumbnails/thumbnail_${Math.floor(Math.random() * 4) + 1}.png)`,
                        backgroundSize: 'cover', backgroundPosition: 'center'
                    }}>
                </div>
                <div className='w-full p-4'>
                    {
                        <div className='user font-semibold '>
                            <p>{createdBy.username}</p>
                        </div>
                    }
                    <div className="details cursor-pointer" onClick={() => navigate(`/quiz/participate/${quizId}`)} >
                        <h3 className='text-lg font-medium  text-[var(---colot-text)]'>{trimmed(title, 10)}</h3>
                        <p className='text-md text-[var(---color-text-light)]'>{trimmed(description, 20)}</p>
                        <div className='text-sm  text-[var(---color-text-xlight)]'>
                            {
                                timer?.duration ? (
                                    <span>Duration: {Math.floor(timer.duration / 60)} Minutes {timer.duration % 60} Seconds</span>
                                ) : ''
                            }
                        </div>
                    </div>
                    <div className='flex gap-2.5 my-2'>
                        <div className='cursor-pointer' onClick={() => { edit({ title, description, timer, category, quizId }) }}><FilePen size={28} /></div>
                        <div className='cursor-pointer' onClick={() => { deleteQuiz(quizId) }}><Trash size={28} /></div>
                    </div>
                </div>
            </div>
            <div className=''>
                <button type='button ' className='p-2 bg-[#000000c7] text-white cursor-pointer w-full'
                    onClick={() => navigate(`/quiz/create/${quizId}`, { replace: true, state: quiz })}>
                    Update Questions
                </button>
            </div>
            {
                topParticipants ?
                    <div className='p-4 font-mono'>
                        <p className='text-lg text-center font-semibold '>
                            Total Participated User :  <span>{totalParticipants}</span>
                        </p>
                        <table className="mt-4 w-full border border-[var(---border-default)] text-sm text-left">
                            <thead className="bg-gray-100">
                                <tr className='px-4 py-2 text-lg text-center font-semibold my-4'>
                                    <th colSpan={3} className='text-gray-700'>Top 3 Participants</th>
                                </tr>
                                <tr>
                                    <th className="border border-[var(---border-default)] px-4 py-2 font-semibold text-gray-700">User Name</th>
                                    <th className="border border-[var(---border-default)] px-4 py-2 font-semibold text-gray-700">Correct Ans.</th>
                                    <th className="border border-[var(---border-default)] px-4 py-2 font-semibold text-gray-700">Time Spent</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topParticipants.map((p, idx) => (
                                    <tr key={idx} className=" ">
                                        <td className="border border-[var(---border-default)] px-4 py-2">{p.username}</td>
                                        <td className="border border-[var(---border-default)] px-4 py-2">{p.correctCount}</td>
                                        <td className="border border-[var(---border-default)] px-4 py-2">{GetTime({ duration: p.timespent })}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div> :
                    <div className='p-4 font-mono text-center text-lg'>
                        <p>No One Participated in this quiz</p>
                    </div>
            }
        </div>
    )
}

export default QuizCardDash