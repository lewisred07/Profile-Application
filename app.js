// creating the profiles array to hold the profile objects
const profiles = [];

// Keeps track of the next id to give out so every profile has a unique one.
let nextId = 1;

// Id of the profile currently being edited (null means we are adding a new profile).
let editingId = null;

// the function validateProfile confirms the required values for the profile are present and valid.
function validateProfile(name, age, email, bio) {
  const errors = [];

  // Name is required, can't be blank or only spaces 
  if (typeof name !== "string" || name.trim() === "") {
    errors.push("Name is required.");
  } else if (name.trim().length < 2) {
    errors.push("Name must be at least 2 characters.");
  }

  // Age is required, must be a whole number between 1 and 122
  if (age === "" || age === null || age === undefined) {
    errors.push("Age is required.");
  } else if (isNaN(Number(age)) || !Number.isInteger(Number(age))) {
    errors.push("Age must be a whole number.");
  } else if (Number(age) < 1 || Number(age) > 122) {
    errors.push("Age must be between 1 and 122.");
  }

  // Email is required and must look like an email (text@text.text) 
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (typeof email !== "string" || email.trim() === "") {
    errors.push("Email is required.");
  } else if (!emailPattern.test(email.trim())) {
    errors.push("Email must look like name@example.com.");
  } else {
    // Block duplicates: look through the array for the same email.
    for (let i = 0; i < profiles.length; i++) {
      if (profiles[i].email.toLowerCase() === email.trim().toLowerCase()) {
        errors.push("A profile with that email already exists.");
        break;
      }
    }
  }

  // Bio is optional, but cap the length if one is given
  if (bio && bio.length > 300) {
    errors.push("Bio must be 300 characters or less.");
  }

  return errors;
}


// the function addProfile creates a new profile object and adds it to the profiles array if valid
function addProfile(name, age, email, bio) {
  const errors = validateProfile(name, age, email, bio);

  // If there are any errors, stop here and do NOT touch the array.
  if (errors.length > 0) {
    return { success: false, errors: errors, profile: null };
  }

  // Otherwise build the profile object (cleaned up) and store it
  const profile = {
    id: nextId,
    name: name.trim(),
    age: Number(age),
    email: email.trim(),
    bio: bio ? bio.trim() : ""
  };

  nextId++;              // get ready for the next profile
  profiles.push(profile); // add the object to the end of the array

  return { success: true, errors: [], profile: profile };
}

// function updateProfile replaces an existing profile in the array with edited information.
function updateProfile(id, name, age, email, bio) {
  const index = profiles.findIndex(function (p) {
    return p.id === id;
  });
  const oldProfile = profiles[index];

  // Temporarily take the profile out so its own email is not flagged as a duplicate.
  profiles.splice(index, 1);

  const errors = validateProfile(name, age, email, bio);

  // If anything is invalid, put the original profile back unchanged.
  if (errors.length > 0) {
    profiles.splice(index, 0, oldProfile);
    return { success: false, errors: errors, profile: null };
  }

  // Otherwise build the updated profile (keeping the same id) in the same spot.
  const profile = {
    id: oldProfile.id,
    name: name.trim(),
    age: Number(age),
    email: email.trim(),
    bio: bio ? bio.trim() : ""
  };

  profiles.splice(index, 0, profile);

  return { success: true, errors: [], profile: profile };
}

// the function runConsoleChecks() ensures through the console that the code works as expected
function runConsoleChecks() {
  console.log("===== CONSOLE CHECKS =====");
  console.log("Starting array length:", profiles.length); // expect 0

  // --- Check 1: valid profiles get created ---
  console.log("--- Check 1: creating valid profiles ---");
  const r1 = addProfile("Jordan Lee", 24, "jordan@example.com", "I like hiking.");
  console.log("Result 1:", r1);
  const r2 = addProfile("Sam Rivera", "31", "sam@example.com", "");
  console.log("Result 2:", r2);

  // --- Check 2: validation rejects bad input ---
  console.log("--- Check 2: validation with bad input ---");
  console.log("Empty name   ->", addProfile("", 20, "a@b.com", "").errors);
  console.log("Missing age  ->", addProfile("Taylor", "", "t@b.com", "").errors);
  console.log("Age too high ->", addProfile("Taylor", 500, "t@b.com", "").errors);
  console.log("Decimal age  ->", addProfile("Taylor", 20.5, "t@b.com", "").errors);
  console.log("Bad email    ->", addProfile("Taylor", 20, "not-an-email", "").errors);
  console.log("Duplicate    ->", addProfile("Jordan Again", 40, "JORDAN@example.com", "").errors);
  console.log("Several bad  ->", addProfile("", "", "", "").errors);

  // --- Check 3: the array only grew for the valid profiles ---
  console.log("--- Check 3: array updates ---");
  console.log("Array length after checks:", profiles.length); // expect 2
  console.log("Profiles array:", profiles);

  // --- Add one more to show the array growing live ---
  addProfile("Casey Morgan", 28, "casey@example.com", "Coffee and code.");
  console.log("After adding Casey, length is:", profiles.length); // expect 3
  console.log("===== END CHECKS =====");

  // Clear the demo data so the page starts empty for the real user.
  profiles.length = 0;
  nextId = 1;
}

// function renderProfiles() redraws the list on the page from the `profiles` array.
function renderProfiles() {
  const list = document.getElementById("profile-list");
  const count = document.getElementById("profile-count");
  list.innerHTML = ""; // clear the old list

  count.textContent = profiles.length + (profiles.length === 1 ? " profile" : " profiles");

  if (profiles.length === 0) {
    list.innerHTML = '<p class="empty">No profiles yet. Fill out the form to add the first one.</p>';
    return;
  }

  // Loop through the array and build one card per profile object.
  profiles.forEach(function (p) {
    const card = document.createElement("article");
    card.className = "profile-card";

    const title = document.createElement("h3");
    title.textContent = p.name + ", " + p.age;

    const email = document.createElement("p");
    email.className = "profile-email";
    email.textContent = p.email;

    card.appendChild(title);
    card.appendChild(email);

    if (p.bio !== "") {
      const bio = document.createElement("p");
      bio.textContent = p.bio;
      card.appendChild(bio);
    }

    // Container for the Edit and Remove buttons of this card.
    const actions = document.createElement("div");
    actions.className = "profile-actions";

    // Edit button: loads this profile back into the form, also remembers which profile the button belongs to.
    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.textContent = "Edit";
    editButton.dataset.action = "edit";
    editButton.dataset.id = p.id;

    // Remove button: deletes this profile from the array.
    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.textContent = "Remove";
    removeButton.dataset.action = "remove";
    removeButton.dataset.id = p.id;

    actions.appendChild(editButton);
    actions.appendChild(removeButton);
    card.appendChild(actions);

    list.appendChild(card);
  });
}

// Load a profile from the array back into the form so it can be edited.
function startEditing(id) {
  const profile = profiles.find(function (p) {
    return p.id === id;
  });
  const form = document.getElementById("profile-form");
  const messages = document.getElementById("messages");

  editingId = id;

  form.elements["name"].value = profile.name;
  form.elements["age"].value = profile.age;
  form.elements["email"].value = profile.email;
  form.elements["bio"].value = profile.bio;

  // Change the button text so the user knows they are editing.
  form.querySelector('input[type="submit"]').value = "Save Changes";
  form.elements["name"].focus();

  messages.className = "messages success";
  messages.textContent = "Editing " + profile.name + ". Press Esc to cancel.";
}

// Leave edit mode and put the form back to normal.
function stopEditing() {
  const form = document.getElementById("profile-form");

  editingId = null;
  form.reset();
  form.querySelector('input[type="submit"]').value = "Submit Profile";
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("profile-form");
    const messages = document.getElementById("messages");

    // When the form is submitted, read the values and call addProfile().
    form.addEventListener("submit", function (event) {
      event.preventDefault(); // stop the page from reloading

      // If we are editing, save changes to the existing profile instead of adding a new one.
      if (editingId !== null) {
        const editResult = updateProfile(
          editingId,
          form.elements["name"].value,
          form.elements["age"].value,
          form.elements["email"].value,
          form.elements["bio"].value
        );

        if (editResult.success) {
          messages.className = "messages success";
          messages.textContent = "Updated " + editResult.profile.name + "'s profile.";
          stopEditing();
        } else {
          messages.className = "messages error";
          messages.innerHTML = "";
          editResult.errors.forEach(function (msg) {
            const line = document.createElement("div");
            line.textContent = msg;
            messages.appendChild(line);
          });
        }
        renderProfiles();
        return; // skip the "add new profile" code below
      }

      const result = addProfile(
        form.elements["name"].value,
        form.elements["age"].value,
        form.elements["email"].value,
        form.elements["bio"].value
      );

      if (result.success) {
        messages.className = "messages success";
        messages.textContent = "Saved " + result.profile.name + "'s profile.";
        form.reset();
        console.log("Profile added:", result.profile);
        console.log("Profiles array now has", profiles.length, "item(s):", profiles);
      } else {
        messages.className = "messages error";
        messages.innerHTML = "";
        result.errors.forEach(function (msg) {
          const line = document.createElement("div");
          line.textContent = msg;
          messages.appendChild(line);
        });
        console.log("Profile rejected:", result.errors);
      }
      renderProfiles();
    });

    // One click listener on the profile list handles every Edit and Remove button
    document.getElementById("profile-list").addEventListener("click", function (event) {
      // Find the button that was clicked (if any)
      const button = event.target.closest("button");
      if (!button) {
        return;
      }

      const id = Number(button.dataset.id);

      if (button.dataset.action === "edit") {
        startEditing(id);
      } else if (button.dataset.action === "remove") {
        const index = profiles.findIndex(function (p) {
          return p.id === id;
        });
        const removedName = profiles[index].name;

        // If the profile being removed is the one being edited, leave edit mode.
        if (editingId === id) {
          stopEditing();
        }

        // remove the profile from the array, then redraw the page from it
        profiles.splice(index, 1);
        messages.className = "messages success";
        messages.textContent = "Removed " + removedName + "'s profile.";
        renderProfiles();
      }
    });

    // pressing the esc key cancels editing
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && editingId !== null) {
        stopEditing();
        messages.className = "messages success";
        messages.textContent = "Edit cancelled.";
      }
    });

    runConsoleChecks(); // show the test output in the console on load
    renderProfiles();
  });
} else {
  // running in Node (no page): just run the checks
  runConsoleChecks();
}