const baseUrl = "https://global-nasal-environment.glitch.me/books";




// Login validation
if (document.getElementById("loginForm")) {
  document.getElementById("loginForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (email === "admin@empher.com" && password === "empher@123") {
      localStorage.setItem("loginData", JSON.stringify({ email }));
      alert("Logged in as Admin.");
      window.location.href = "admin.html";
    } else if (email === "user@empher.com" && password === "user@123") {
      localStorage.setItem("loginData", JSON.stringify({ email }));
      window.location.href = "books.html";
    } else {
      alert("Invalid credentials.");
    }
  });
}

// Admin functionality
if (document.getElementById("addBookForm")) {
  const loginData = JSON.parse(localStorage.getItem("loginData"));
  if (!loginData || loginData.email !== "admin@empher.com") {
    alert("Admin Not Logged In.");
    window.location.href = "index.html";
  }

  document.getElementById("addBookForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const title = document.getElementById("title").value;
    const author = document.getElementById("author").value;
    const category = document.getElementById("category").value;
    

    fetch(baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        author,
        category,
        isAvailable: true,
        isVerified: false,
        borrowedDays: null,
        imageUrl: "https://m.media-amazon.com/images/I/71ZB18P3inL._SY522_.jpg",
      }),
    })
     .then(()=>alert("book added successfully"))
     .then(()=>fetchBooks)
  });

  function fetchBooks() {
    fetch(baseUrl)
      .then((res) => res.json())
      .then((books) => {
        const grid = document.getElementById("bookGrid");
        grid.innerHTML = books
          .map(
            (book) => `
            <div class="book-card">
              <img src="${book.imageUrl}" alt="Book Image" style="width:100%">
              <h3>${book.title}</h3>
              <p>Author: ${book.author}</p>
              <p>Category: ${book.category}</p>
              <button onclick="verifyBook(${book.id})" ${
              book.isVerified ? "disabled" : ""
            }>Verify</button>
              <button onclick="deleteBook(${book.id})">Delete</button>
            </div>
          `
          )
          .join("");
      });
  }

  fetchBooks();

  window.verifyBook = (id) => {
    if (confirm("Are you sure to Verify..?")) {
      fetch(`${baseUrl}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVerified: true }),
      }).then(() => fetchBooks());
    }
  };

  window.deleteBook = (id) => {
    if (confirm("Are you sure to Delete..?")) {
      fetch(`${baseUrl}/${id}`, { method: "DELETE" }).then(() => fetchBooks());
    }
  };
}





// Function to render books
function renderBooks(books) {
  const grid = document.getElementById("bookGrid");
  grid.innerHTML = ""; // Clear the grid before displaying new books

  if (books.length === 0) {
    grid.innerHTML = `<p>No books found.</p>`;
    return;
  }

  books.forEach((book) => {
    const bookCard = document.createElement("div");
    bookCard.classList.add("book-card");

    bookCard.innerHTML = `
      <img src="${book.imageUrl}" alt="${book.title}" style="width:100%">
      <h3>${book.title}</h3>
      <p>Author: ${book.author}</p>
      <p>Category: ${book.category}</p>
      <p>Status: ${book.isAvailable ? "Available" : "Borrowed"}</p>
      ${
        book.isAvailable
          ? `<button onclick="borrowBook(${book.id})">Borrow</button>`
          : `<p>Borrowed Days: ${book.borrowedDays || "N/A"}</p>`
      }
    `;

    grid.appendChild(bookCard);
  });
}

// Fetch and display available books
document.getElementById("showAvailable").addEventListener("click", () => {
  fetch(`${baseUrl}?isAvailable=true`)
    .then((response) => response.json())
    .then((books) => {
      renderBooks(books); // Render the available books
    })
    .catch((error) => console.error("Error fetching available books:", error));
});

// Fetch and display borrowed books
document.getElementById("showBorrowed").addEventListener("click", () => {
  fetch(`${baseUrl}?isAvailable=false`)
    .then((response) => response.json())
    .then((books) => {
      renderBooks(books); // Render the borrowed books
    })
    .catch((error) => console.error("Error fetching borrowed books:", error));
});

// Borrow a book
function borrowBook(id) {
  const borrowedDays = prompt("Enter the number of days to borrow the book:");
  if (!borrowedDays || isNaN(borrowedDays) || borrowedDays <= 0) {
    alert("Invalid input. Please enter a positive number.");
    return;
  }

  fetch(`${baseUrl}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isAvailable: false, borrowedDays }),
  })
    .then(() => {
      alert("Book borrowed successfully!");
      document.getElementById("showAvailable").click(); // Refresh the available books list
    })
    .catch((error) => console.error("Error borrowing book:", error));
}
