import { Client, ID, Query, Databases } from 'appwrite';

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject(PROJECT_ID);

const database = new Databases(client);

export const updateSearchCount = async (searchTerm, movie, series, isMovie) => {
    try {
        // 1. Check if searchTerm exists
        const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.equal('searchTerm', searchTerm)
        ]);

        if (result.documents.length > 0) {
            const doc = result.documents[0];

            // 2. Update count
            await database.updateDocument(DATABASE_ID, COLLECTION_ID, doc.$id, {
                count: doc.count + 1
            });
        } else if (isMovie) { // 3.a. If it doesn't create a new movie document 
            await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
                searchTerm,
                count: 1,
                movie_id: movie.id,
                poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            });
        } else { // 3.b. If it doesn't create a new series document instead
            await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
                searchTerm,
                count: 1,
                series_id: series.id,
                poster_url: `https://image.tmdb.org/t/p/w500${series.poster_path}`
            });
        }

    } catch (error) {
        console.error(error);
    }
}

export const getTrendingShows = async () => {
    try {
        const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.limit(5), 
            Query.orderDesc("count")
        ])
        return result.documents;
    } catch (error) {
        console.error(error);
    }
}
