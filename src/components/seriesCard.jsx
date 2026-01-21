import React from 'react'
import { useDebounce } from 'react-use'

const SeriesCard = ( { series : 
    {name, vote_average, poster_path, first_air_date, original_language } 
}) => {
    return (
        <div className="series-card">
           <img 
                src={poster_path ? `https://image.tmdb.org/t/p/w500/${poster_path}` : '/no-poster.png'} 
                alt={name} />

            <div className="mt-4">
                <h3>{name}</h3>

                <div className="content">
                    <div className="rating">
                        <img src="star.svg" alt="Star Icon" />
                        <p>{vote_average ? vote_average.toFixed(1) : 'N/A'}</p>
                    </div>
                    <span>•</span>
                    <p className="lang">{original_language}</p>
                    
                    <span>•</span>
                    <p className="first-air-date">
                        {first_air_date ? first_air_date.split('-')[0] : "N/A"}
                    </p>
                </div>
            </div>
        </div>

    )
}


export default SeriesCard