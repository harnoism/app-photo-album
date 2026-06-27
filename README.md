# Photo Album Application

A full-stack web application allowing users to create, organize and share photo albums.

The project uses an **MVC (Model - View - Controller)** architecture as well as **Object-Oriented Programming (OOP)** on both the frontend and backend.


## Features

The application allows users to:

- Create a user account
- Log in to the application
- Create photo albums
- Add and delete photos
- Add descriptions and tags
- Manage comments
- Share albums
- Manage access permissions
- Search and filter photos


## Project Architecture

The project is organized with a clear separation between the frontend and backend.

```bash
app-photo-album/

bdd/
  ├── Controllers/
  ├── Models/
  ├── index.php
  └── sql-connect.php
frontend/
  ├── albums/
  ├── Login/
  ├── Partager/
  ├── photo-add/
  ├── album-compte/
  └── register/
database/
  └── app_photo_album.sql

```


## Technologies Used


### Frontend

- HTML5
- CSS3
- JavaScript
- Object-Oriented Programming (OOP)


### Backend

- PHP
- Object-Oriented Programming (OOP)
- MVC Architecture


### Database

- MySQL
- phpMyAdmin


## Installation


### Clone the project

```bash
git clone https://github.com/harnoism/app-photo-album.git
```

## Environment Setup
Start your local server using XAMPP / WAMP / MAMP
Place the project inside:

```htdocs/app-photo-album```

Import the database file into phpMyAdmin:

```database/app_photo_album.sql```

Configure the database connection in:

```bdd/sql-connect.php```

# Run the application
Open your browser:

```http://localhost/app-photo-album/frontend/Login/login.html```

## Database Setup
The database export is available here:

```database/app_photo_album.sql```

Import it using phpMyAdmin before running the application.

## Main Features
### Authentication
Users can:

- Create an account
- Log in to the application
- Photo Album Management

Users can:
  - Create, edit and delete photo albums
  - Add photos to albums
  - Upload images through an upload system
  - Add titles, descriptions and creation dates to albums
  - Organize albums and photos using tags
  - Add information such as photo descriptions and capture dates
  - Sharing & Access Management

The application allows users to:
  - Define album visibility:
  - Private
  - Public
  - Restricted access
  - Share albums with other users
  - interact with albums
  - Manage user permissions
  - Control access rights for viewing or modifying content
  - Comments Management

Users can:
  - Add comments on photos
  - Edit their own comments
  - Delete their comments
  - View comments on accessible photos and albums
  - Search & Filtering

The application provides:
  - Search by photo or album tags
  - Filter photos by date
  - Search albums by title
  - Quickly find specific photos inside albums

  
## Screenshots

### Login Page

<img width="1917" height="904" alt="Capture d&#39;écran 2026-06-27 175733" src="https://github.com/user-attachments/assets/00d05977-7007-449c-a7d6-c4caabac2177" />


### Register Page

<img width="1919" height="910" alt="Capture d&#39;écran 2026-06-27 175751" src="https://github.com/user-attachments/assets/af1dc82d-87a5-4282-a301-484410645b3e" />


### Album

<img width="1919" height="914" alt="Capture d&#39;écran 2026-06-27 175811" src="https://github.com/user-attachments/assets/d00ce1d4-a7ff-4f2f-bb92-313928063075" />

### Create Album

<img width="1919" height="911" alt="Capture d&#39;écran 2026-06-27 175824" src="https://github.com/user-attachments/assets/9995c030-1186-49ca-94dd-55d3843d894f" />


### Filter Album

<img width="1916" height="913" alt="Capture d&#39;écran 2026-06-27 175839" src="https://github.com/user-attachments/assets/f98ce785-1519-4cdb-be50-32a1a027a8cb" />


### Photo

<img width="1919" height="911" alt="Capture d&#39;écran 2026-06-27 175853" src="https://github.com/user-attachments/assets/21215076-523a-4c18-b8ca-9f8423bd6381" /> 
<img width="1919" height="908" alt="Capture d&#39;écran 2026-06-27 175913" src="https://github.com/user-attachments/assets/218b7010-c5c5-47ea-9bfe-f807e6bb3ddf" />


### Comments

<img width="1917" height="911" alt="Capture d&#39;écran 2026-06-27 175935" src="https://github.com/user-attachments/assets/cb7a763f-9501-48c3-8369-4b7ed4586825" />


### Sharing

<img width="1918" height="915" alt="Capture d&#39;écran 2026-06-27 175953" src="https://github.com/user-attachments/assets/2985e9d5-9ecc-4c93-a012-2e9133939724" />
<img width="1919" height="915" alt="Capture d&#39;écran 2026-06-27 180120" src="https://github.com/user-attachments/assets/21ee34a4-f06c-4f7a-924c-eca3342d2ca2" />


### User Profile

<img width="1917" height="917" alt="Capture d&#39;écran 2026-06-27 180020" src="https://github.com/user-attachments/assets/480e4d09-cad7-4281-981a-99beabcfea65" />


## Requirements Fulfilled

- MVC Architecture
- PHP Object-Oriented Programming
- JavaScript Object-Oriented Programming
- MySQL Database
- Responsive Interface
- W3C Standards Compliance

## Author

Maeva
Bachelor Informatique — 2026
Project developed as part of a full-stack web development project.
