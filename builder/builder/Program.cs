using System;
using Npgsql;
using System.Xml;
using System.Data;

namespace builder
{
    class Program
    {

        static NpgsqlConnection Connection()
        {
            NpgsqlConnection conn = null;

            string host, usr, pwd, db;
            host = "localhost";
            usr = "postgres";
            pwd = "Passw0rd!";
            db = "EXTENSIONS_DB";

            string strConn = $@"Host={host};username={usr};password={pwd};database={db};";

            try { conn = new NpgsqlConnection(strConn); }
            catch(Exception e) { Console.WriteLine($"Couldn't connect to the database due to the following reasons: {e.Message}"); }

            return conn;
        }

        static void Main(string[] args)
        {
            NpgsqlDataAdapter NpAdapter = null;
            NpgsqlDataReader dr = null;
            NpgsqlConnection conn = Connection();

            conn.Open();

            try
            {
                DataSet dataset = new DataSet("HN_EXTENSIONS");
                NpAdapter = new NpgsqlDataAdapter();
                string query = "SELECT * FROM \"extension_Info\"";
                var command = NpAdapter.SelectCommand = new NpgsqlCommand(query, conn);

                NpAdapter.Fill(dataset, "extension_Info");
                dataset.WriteXml("testfile.XML");

            }
            catch (Exception e)
            {
                Console.WriteLine("An error occured: " + e.Message);
            }

            conn.Close();
        }
    }
}
