using System;
using Npgsql;
using System.Xml;

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
            Console.WriteLine("Testing connection");

            Connection().Open();

            Connection().Close();
        }
    }
}
