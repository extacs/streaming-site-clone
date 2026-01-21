import Search from "./components/search.jsx"
import Spinner from "./components/spinner.jsx"
import MovieCard from "./components/movieCard.jsx";
import SeriesCard from "./components/seriesCard.jsx";
import {useEffect, useState} from 'react'
import { useDebounce } from "react-use";
import { getTrendingShows, updateSearchCount } from "./appwrite.js";

const API_BASE_URL = 'https://api.themoviedb.org/3'; // separate base url for cleaner code

const API_KEY = import.meta.env.VITE_TMDB_API_KEY; 

const API_OPTIONS = { // always check this section for type errors, as it should follow fetch's options
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: `Bearer ${API_KEY}`
    } 
}

const App = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [movieList, setMovieList] = useState([]);
    const [seriesList, setSeriesList] = useState([]);
    const [trendingShows, setTrendingShows] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [debouncedSearchTerm, setdebouncedSearchTerm] = useState('');

    useDebounce( () => setdebouncedSearchTerm(searchTerm), 500, [searchTerm])

    const fetchShows = async(query = '') => {
        setIsLoading(true);
        setErrorMessage('');

        try {
            const endpoints = query ? 
            [                                                                        // OBJECT | INDEX
                `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`,   // Movies :   0
                `${API_BASE_URL}/search/tv?query=${encodeURIComponent(query)}`       // Series :   1
            ]
            : [                                           
                `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`,  
                `${API_BASE_URL}/discover/tv?sort_by=popularity.desc`       
            ];
            const responses = await Promise.all ( // multiple response fetching
                endpoints.map(endpoint => fetch(endpoint, API_OPTIONS)) 
            );

            responses.forEach(response => // multiple response handling
                {if (!response.ok) {
                    throw new Error('Failed to fetch shows');
                }
            });

            const datas = await Promise.all ( // multiple data fetching
                responses.map(response => response.json())
            );

            if(datas[0].response === 'False') {
                setErrorMessage(datas.Error || 'Failed to fetch movies');
                setMovieList([]);
                return;
            }
            if(datas[1].response === 'False') {
                setErrorMessage(datas.Error || 'Failed to fetch series');
                setSeriesList([]);
                return;
            }

            console.log(datas[0].results);
            
            setMovieList(datas[0].results || []);
            setSeriesList(datas[0].results || []);

            if (query && datas[0].results.length > 0) { // idk why I made separate for the 2 (Movies & Series)
                await updateSearchCount(query, datas[0].results[0], datas[1].results[0], true)
            }
            if (query && datas[1].results.length > 0) {
                await updateSearchCount(query, datas[0].results[0], datas[1].results[0], false)
            }
        } catch (error) {
            console.error(`Error fetching shows: ${error}`);
            setErrorMessage('Failed fetching shows. Please try again later.')
        } finally {
            setIsLoading(false);
        }
    }

    const loadTrendingShows = async () => {
        try {
            const shows = await getTrendingShows();

            setTrendingShows(shows)
        } catch (error) {
            console.error(`Error fetching trending shows: ${error}`); // just console.log no setErrorMessage()
        }
    }

    useEffect(() => {
        fetchShows(debouncedSearchTerm);
    }, [debouncedSearchTerm]);

    useEffect(() => {
        loadTrendingShows();
    }, [])

    return (
        <main>
            <div className="pattern" />
            <div className='wrapper'>
                <header>
                    
                    <img src="./hero-img.png" alt="Banner" />
                    <h1>
                        My Own Collection of <span className="movie-text-gradient">Movies</span> & <span className="shows-text-gradient">Series</span> I'll/'ve Watch/ed All For You
                    </h1>

                    <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                </header>

                {trendingShows.length > 0 && (
                    <section className="trending">
                        <h2> Trending Movies</h2>

                        <ul>
                            {trendingShows.map((show, index) => (
                                <li key={show.$id}>
                                    <p>{index + 1}</p>
                                    <img src={show.poster_url} alt={show.title} />
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
                
                <section className="all-movies pb-10">
                    <h2> All Movies </h2>
                    {isLoading ? ( // outer/first ternary
                        <Spinner /> // if 1st ternary true 
                    ) : errorMessage ? ( // else if 1st ternary false, inner/second ternary
                        <p className="text-red-500">{errorMessage}</p> // if 2nd ternary true
                    ): ( // else do this
                        <ul>
                            {movieList.map((movie) => (
                                <MovieCard key={movie.id} movie={movie}/>
                            ))}
                        </ul>
                    )}
                </section>
                <section className="all-series">
                    <h2 className="mt-10"> All Series </h2>
                    {isLoading ? ( // outer/first ternary
                        <Spinner /> // if 1st ternary true 
                    ) : errorMessage ? ( // else if 1st ternary false, inner/second ternary
                        <p className="text-red-500">{errorMessage}</p> // if 2nd ternary true
                    ) : ( // else do this
                        <ul>
                            {seriesList.map((series) => (
                                <SeriesCard key={series.id} series={series}/>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </main>
    )
}

export default App