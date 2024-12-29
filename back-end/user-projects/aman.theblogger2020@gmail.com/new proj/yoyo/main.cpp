#include <iostream>
#include <iomanip>
#include <vector>
#include <fstream>
#include <sstream>
#include <string>
#include <algorithm>
#include <ctime>
#include <cctype>
#include <stdexcept>

class User {
private:
    std::string name;
    std::string email;
    std::string phone;
    std::string dob;
    std::string username;
    std::string password;

public:
    User() = default;

    bool registerUser()
    {
        std::cout << "\n**** USER REGISTRATION ****\n\n";

        std::cout << "Enter Full Name: ";
        std::getline(std::cin >> std::ws, name);

        std::cout << "Enter Email: ";
        std::cin >> email;

        std::cout << "Enter Phone Number: ";
        std::cin >> phone;

        std::cout << "Enter Date of Birth (YYYY-MM-DD): ";
        std::cin >> dob;

        std::cout << "Create Username: ";
        std::cin >> username;

        std::cout << "Create Password: ";
        std::cin >> password;

        // Save user to CSV
        std::ofstream userFile("users.csv", std::ios::app);
        if (!userFile.is_open())
        {
            std::cerr << "Error opening user file!\n";
            return false;
        }

        userFile << name << ","
                 << email << ","
                 << phone << ","
                 << dob << ","
                 << username << ","
                 << password << "\n";
        userFile.close();

        std::cout << "**** Registration Successful! ****\n";
        return true;
    }

    bool login()
    {
        std::string inputUsername, inputPassword;
        std::cout << "\n**** USER LOGIN ****\n\n";
        std::cout << "Username: ";
        std::cin >> inputUsername;
        std::cout << "Password: ";
        std::cin >> inputPassword;
        std::cout << "\n";

        std::ifstream userFile("users.csv");
        if (!userFile.is_open())
        {
            std::cerr << "Error opening user file!\n";
            return false;
        }

        std::string line;
        while (std::getline(userFile, line))
        {
            std::stringstream ss(line);
            std::string fields[6];

            for (int i = 0; i < 6; ++i)
            {
                std::getline(ss, fields[i], ',');
            }

            if (fields[4] == inputUsername && fields[5] == inputPassword)
            {
                name = fields[0];
                email = fields[1];
                return true;
            }
        }

        std::cout << "Invalid credentials!\n\n";
        return false;
    }

    std::string getName() const { return name; }
    std::string getEmail() const { return email; }
};

class Flight
{
private:
    std::string flightNumber;
    std::string origin;
    std::string destination;
    std::string departureTime;
    std::string arrivalTime;
    int economySeats;
    int businessSeats;
    int firstClassSeats;

public:
    Flight(std::string number = "", std::string orig = "", std::string dest = "",
           std::string depTime = "", std::string arrTime = "",
           int economy = 50, int business = 20, int firstClass = 10)
        : flightNumber(number), origin(orig), destination(dest),
          departureTime(depTime), arrivalTime(arrTime),
          economySeats(economy), businessSeats(business), firstClassSeats(firstClass) {}

    void displayFlightDetails() const
    {
        std::cout << std::left
                  << std::setw(15) << flightNumber
                  << std::setw(15) << origin
                  << std::setw(15) << destination
                  << std::setw(15) << departureTime
                  << std::setw(15) << arrivalTime << "\n\n";
    }

    bool searchFlight(const std::string &searchOrigin, const std::string &searchDestination) const
    {
        return (origin == searchOrigin && destination == searchDestination);
    }

    std::string getFlightNumber() const { return flightNumber; }
    std::string getOrigin() const { return origin; }
    std::string getDestination() const { return destination; }

    int getAvailableSeats(const std::string &seatClass) const
    {
        if (seatClass == "Economy")
            return economySeats;
        if (seatClass == "Business")
            return businessSeats;
        if (seatClass == "FirstClass")
            return firstClassSeats;
        return 0;
    }
};

class Ticket
{
private:
    std::string ticketId;
    std::string passengerName;
    std::string flightNumber;
    std::string seatNumber;
    std::string seatClass;

public:
    Ticket(const std::string &name, const std::string &flight,
           const std::string &seat, const std::string &sClass)
        : passengerName(name), flightNumber(flight),
          seatNumber(seat), seatClass(sClass)
    {
        generateTicketId();
    }

    void generateTicketId()
    {
        // Simple ticket ID generation
        std::srand(std::time(nullptr));
        ticketId = "TKT" + std::to_string(std::rand() % 10000);
    }

    void displayTicketDetails() const
    {
        std::cout << "**** TICKET DETAILS ****\n";
        std::cout << "Ticket ID: " << ticketId << "\n";
        std::cout << "Passenger: " << passengerName << "\n";
        std::cout << "Flight Number: " << flightNumber << "\n";
        std::cout << "Seat Number: " << seatNumber << "\n";
        std::cout << "Seat Class: " << seatClass << "\n\n";
    }

    std::string getTicketId() const { return ticketId; }
};

class AirlineBookingSystem
{
private:
    std::vector<Flight> flights;
    std::vector<Ticket> bookedTickets;
    User currentUser;

    void adminLogin()
    {
        std::string username, password;
        std::cout << "\n**** ADMIN LOGIN ****\n\n";
        std::cout << "Username: ";
        std::cin >> username;
        std::cout << "Password: ";
        std::cin >> password;

        if (username == "admin" && password == "admin@123")
        {
            adminMenu();
        }
        else
        {
            std::cout << "Invalid Admin Credentials!\n\n";
        }
    }

    void adminMenu()
    {
        int choice;
        do
        {
            std::cout << "\n";
            std::cout << "x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x\n";
            std::cout << "x                               x\n";
            std::cout << "| Airline Ticket Booking System |\n";
            std::cout << "x         (ADMIN MENU)          x\n";
            std::cout << "|                               |\n";
            std::cout << "x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x\n";
            std::cout << "|                               |\n";
            std::cout << "x 1. Add New Flight             x\n";
            std::cout << "| 2. Remove Flight              |\n";
            std::cout << "x 3. Exit Admin Menu            x\n";
            std::cout << "|                               |\n";
            std::cout << "x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x\n\n";
            std::cout << "Enter Choice: ";
            std::cin >> choice;

            switch (choice)
            {
            case 1:
                addFlight();
                break;
            case 2:
                removeFlight();
                break;
            case 3:
                return;
            default:
                std::cout << "Invalid Choice!\n\n";
            }
        } while (true);
    }

    void addFlight()
    {
        std::string number, origin, destination, depTime, arrTime;
        int economySeats, businessSeats, firstClassSeats;

        std::cout << "\n**** ADD NEW FLIGHT ****\n\n";
        std::cout << "Flight Number: ";
        std::cin >> number;
        std::cout << "Origin: ";
        std::cin >> origin;
        std::cout << "Destination: ";
        std::cin >> destination;
        std::cout << "Departure Time: ";
        std::cin >> depTime;
        std::cout << "Arrival Time: ";
        std::cin >> arrTime;
        std::cout << "Economy Seats: ";
        std::cin >> economySeats;
        std::cout << "Business Seats: ";
        std::cin >> businessSeats;
        std::cout << "First Class Seats: ";
        std::cin >> firstClassSeats;

        Flight newFlight(number, origin, destination, depTime, arrTime,
                         economySeats, businessSeats, firstClassSeats);
        flights.push_back(newFlight);
        std::cout << "Flight Added Successfully!\n\n";
    }

    void removeFlight()
    {
        std::string flightNumber;
        std::cout << "\n**** REMOVE FLIGHT ****\n";
        std::cout << "Enter Flight Number to Remove: ";
        std::cin >> flightNumber;

        auto it = std::remove_if(flights.begin(), flights.end(),
                                 [&flightNumber](const Flight &f)
                                 { return f.getFlightNumber() == flightNumber; });

        if (it != flights.end())
        {
            flights.erase(it, flights.end());
            std::cout << "Flight Removed Successfully!\n\n";
        }
        else
        {
            std::cout << "Flight Not Found!\n\n";
        }
    }

    void viewAvailableFlights()
    {
        std::cout << "\n**** AVAILABLE FLIGHTS ****\n\n";
        std::cout << std::left
                  << std::setw(15) << "Flight Number"
                  << std::setw(15) << "Origin"
                  << std::setw(15) << "Destination"
                  << std::setw(15) << "Departure"
                  << std::setw(15) << "Arrival" << "\n";
        std::cout << std::string(75, '-') << "\n";

        for (const auto &flight : flights)
        {
            flight.displayFlightDetails();
        }
    }

    void searchFlights()
    {
        std::string origin, destination;
        std::cout << "\n**** SEARCH FLIGHTS ****\n\n";
        std::cout << "Enter Origin: ";
        std::cin >> origin;
        std::cout << "Enter Destination: ";
        std::cin >> destination;

        bool found = false;
        for (const auto &flight : flights)
        {
            if (flight.searchFlight(origin, destination))
            {
                flight.displayFlightDetails();
                found = true;
            }
        }

        if (!found)
        {
            std::cout << "No Flights Found!\n\n";
        }
    }

    void displaySeatAvailability()
    {
        std::cout << "\n**** SEAT AVAILABILITY ****\n\n";
        for (const auto &flight : flights)
        {
            std::cout << "Flight: " << flight.getFlightNumber()
                      << " (" << flight.getOrigin() << " to " << flight.getDestination() << ")\n";
            std::cout << "Economy Seats: " << flight.getAvailableSeats("Economy") << "\n";
            std::cout << "Business Seats: " << flight.getAvailableSeats("Business") << "\n";
            std::cout << "First Class Seats: " << flight.getAvailableSeats("FirstClass") << "\n\n";
        }
    }

    void bookTicket()
    {
        if (flights.empty())
        {
            std::cout << "No Flights Available!\n\n";
            return;
        }

        std::string flightNumber, seatClass, seatNumber;
        viewAvailableFlights();

        std::cout << "\n**** BOOK TICKET ****\n\n";
        std::cout << "Enter Flight Number: ";
        std::cin >> flightNumber;

        std::cout << "Select Seat Class (Economy/Business/FirstClass): ";
        std::cin >> seatClass;

        // display seat availability for the user entered flight number
        std::cout << "\n\n**** SEAT AVAILABILITY ****\n\n";
        for (const auto &flight : flights)
        {
            if (flight.getFlightNumber() == flightNumber)
            {
                if (seatClass == "Economy")
                    std::cout << "\nEconomy Seats: 1 - " << flight.getAvailableSeats("Economy") << "\n";
                else if (seatClass == "Business")
                    std::cout << "Business Seats: 1 - " << flight.getAvailableSeats("Business") << "\n";
                else if (seatClass == "FirstClass")
                    std::cout << "First Class Seats: 1 - " << flight.getAvailableSeats("FirstClass") << "\n\n";
                else
                    std::cout << "Invalid Seat Class!\n\n";
            }
        }

        std::cout << "Select Seat Number: ";
        std::cin >> seatNumber;

        // In a real system, you'd check seat availability and update flight seats
        Ticket ticket(currentUser.getName(), flightNumber, seatNumber, seatClass);
        bookedTickets.push_back(ticket);

        std::cout << "\n**** BOOKING SUCCESSFUL ****\n\n";
        ticket.displayTicketDetails();
    }

    void cancelTicket()
    {
        std::string ticketId;
        std::cout << "\n**** CANCEL TICKET ****\n\n";
        std::cout << "Enter Ticket ID: ";
        std::cin >> ticketId;

        auto it = std::remove_if(bookedTickets.begin(), bookedTickets.end(),
                                 [&ticketId](const Ticket &t)
                                 { return t.getTicketId() == ticketId; });

        if (it != bookedTickets.end())
        {
            bookedTickets.erase(it, bookedTickets.end());
            std::cout << "Ticket Cancelled Successfully!\n\n";
        }
        else
        {
            std::cout << "Ticket Not Found!\n\n";
        }
    }

    void viewBookedTickets()
    {
        std::cout << "\n**** BOOKED TICKETS ****\n\n";
        for (const auto &ticket : bookedTickets)
        {
            ticket.displayTicketDetails();
            std::cout << "\n\n";
        }
    }

public:
    void mainMenu()
    {
        int choice;
        while (true)
        {
            std::cout << "\n";
            std::cout << "***********************************************\n";
            std::cout << "*       Airline Ticket Booking System         *\n";
            std::cout << "***********************************************\n";
            std::cout << "*                                             *\n";
            std::cout << "* 1. User Login                               *\n";
            std::cout << "* 2. User Registration                        *\n";
            std::cout << "* 3. Admin Login                              *\n";
            std::cout << "* 4. Exit                                     *\n";
            std::cout << "*                                             *\n";
            std::cout << "***********************************************\n";
            std::cout << "Enter your choice: ";
            std::cin >> choice;

            switch (choice)
            {
            case 1:
            {
                if (currentUser.login())
                {
                    userMenu();
                }
                break;
            }
            case 2:
            {
                User newUser;
                newUser.registerUser();
                break;
            }
            case 3:
                adminLogin();
                break;
            case 4:
                std::cout << "THANK YOU FOR USING OUR TICKETING SYSTEM\n\n";
                return;
            default:
                std::cout << "Invalid Choice!\n\n";
            }
        }
    }

    void userMenu()
    {
        int choice;
        do
        {
            std::cout << "Welcome, " << currentUser.getName() << "!\n\n";
            std::cout << "***********************************************\n";
            std::cout << "*       Airline Ticket Booking System         *\n";
            std::cout << "***********************************************\n";
            std::cout << "*                 (USER MENU)                 *\n";
            std::cout << "*---------------------------------------------*\n";
            std::cout << "*                                             *\n";
            std::cout << "* 1. View Available Flights                   *\n";
            std::cout << "* 2. Search Flights                           *\n";
            std::cout << "* 3. Display Seat Availability                *\n";
            std::cout << "* 4. Book Ticket                              *\n";
            std::cout << "* 5. Cancel Ticket                            *\n";
            std::cout << "* 6. View Booked Tickets                      *\n";
            std::cout << "* 7. Logout                                   *\n";
            std::cout << "*                                             *\n";
            std::cout << "***********************************************\n";
            std::cout << "Enter your choice: \n";
            std::cin >> choice;

            switch (choice)
            {
            case 1:
                viewAvailableFlights();
                break;
            case 2:
                searchFlights();
                break;
            case 3:
                displaySeatAvailability();
                break;
            case 4:
                bookTicket();
                break;
            case 5:
                cancelTicket();
                break;
            case 6:
                viewBookedTickets();
                break;
            case 7:
                return;
            default:
                std::cout << "Invalid Choice!\n\n";
            }
        } while (true);
    }
};

int main()
{
    AirlineBookingSystem airlineSystem;
    airlineSystem.mainMenu();
    return 0;
}



