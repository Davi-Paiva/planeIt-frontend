import { useNavigate } from 'react-router-dom';
import './Home.css';

export const Home = () => {
    const navigate = useNavigate();
    return (
        <div className="home-container">
            <div className="slogan-container">
                <h2>Plan It</h2>
                <h2>Choose It</h2>
                <h2>Live It</h2>
            </div>
            <div className="buttons-container">
                <button className="join-plan-button" onClick={() => {
                    navigate('/join-plan');
                }}>Join a Travel Plan</button>
                <button className="create-plan-button" onClick={() => {
                    navigate('/create-plan');
                }}>Create a Travel Plan</button>
            </div>
        </div>
    )
}