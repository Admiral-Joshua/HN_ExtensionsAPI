import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/** Build an XML file that */
public class builder{

    private final String url = "jdbc:postgresql://localhost:5432/EXTENSIONS_DB";
    private final String user = "postgres";
    private final String password = "Passw0rd!";

    /**
     * Connect to postgreSQL Database.
     */
    public Connection connect() {
        Connection conn = null;
        try{
            conn = DriverManager.getConnection(url, user, password);
            System.out.println("Connected to the PostgreSQL server successfully.");
        } catch(SQLException e) {
            System.out.println(e.getMessage());
        }

        return conn;
    }

    public static void main(String[] args){
        System.out.println("Hello World!");
        builder b = new builder();
        b.connect();
    }

};
