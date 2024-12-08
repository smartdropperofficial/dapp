import { supabase } from '@/utils/supabaseClient';
import { PromoterModelSB } from '../types';

export async function updateDataOnSB(tableName: string, updateValues: Record<string, any>, filterCriteria?: Record<string, any>): Promise<any> {
    if (!tableName || !filterCriteria || !updateValues) {
        throw new Error('Parametri invalidi forniti.');
    }

    try {
        let query = supabase.from(tableName).update(updateValues);

        for (const [key, value] of Object.entries(filterCriteria)) {
            query = query.eq(key, value);
        }

        const { data, error } = await query;

        if (error) {
            throw new Error(`Errore nell'aggiornamento dei dati: ${error.message}`);
        }

        return data;
    } catch (err) {
        console.error("Errore durante l'aggiornamento:", err);
        throw err;
    }
}
export async function createDataOnSB(tableName: string, insertValues: Record<string, any> = {}): Promise<PromoterModelSB> {
    if (!tableName || !insertValues) {
        throw new Error('Parametri invalidi forniti.');
    }
    try {
        const { data, error } = await supabase.from(tableName).insert([insertValues]);

        if (error) {
            throw new Error(`Errore nell'inserimento dei dati: ${error.message}`);
        }
        return data as unknown as PromoterModelSB;
    } catch (err) {
        console.error("Errore durante l'inserimento:", err);
        throw err;
    }
}
export async function getDataFromSB(tableName: string, filterCriteria: Record<string, any> = {}): Promise<any> {
    if (!tableName) {
        throw new Error('Il nome della tabella è obbligatorio.');
    }

    try {
        // Query dinamica sulla tabella fornita
        let query = supabase.from(tableName).select('*');

        // Applicazione dei criteri di filtro dinamici
        for (const [key, value] of Object.entries(filterCriteria)) {
            query = query.eq(key, value);
        }

        // Esecuzione della query
        const { data, error } = await query;
        // console.log("🚀 ~ getDataFromSB ~ data:", data);

        if (error) {
            throw new Error(`Errore nel recupero dei dati: ${error.message}`);
        }

        // Ritorna i dati ottenuti
        return data; // Restituisce l'intero set di dati
    } catch (err) {
        console.error('Errore durante il recupero:', err);
        throw err;
    }
}
