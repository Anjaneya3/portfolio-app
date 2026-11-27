import { uploadFile } from "../services/api.js";

// Describes the fields of each edit form. The edit dialog builds its inputs from these lists.
export const skillFields = [
  { key: "title", label: "Group name", required: true, hint: "For example: Frontend, Backend, Tools" },
  { key: "items", label: "Skills", type: "list", hint: "Separate skills with commas." },
];

export const projectFields = [
  { key: "title", label: "Project name", required: true },
  { key: "description", label: "Description", type: "textarea" },
  { key: "technologies", label: "Technologies", type: "list", hint: "Separate with commas, for example React.js, Spring Boot, MySQL." },
  {
    key: "image",
    label: "Screenshot",
    type: "file",
    accept: "image/png,image/jpeg,image/webp",
    buttonLabel: "Upload screenshot",
    upload: (file) => uploadFile("project", file),
  },
  { key: "githubUrl", label: "Source code link", hint: "Starts with https://" },
  { key: "liveUrl", label: "Live demo link", hint: "Leave empty to hide the demo button." },
  { key: "status", label: "Status", hint: "For example: Completed or In progress." },
  { key: "featured", label: "Show as featured", type: "bool" },
  { key: "published", label: "Show on the public site", type: "bool", default: true },
];

export const educationFields = [
  { key: "degree", label: "Degree", required: true },
  { key: "institution", label: "Institution" },
  { key: "period", label: "Period", hint: "For example: Expected 2027" },
  { key: "details", label: "Details", type: "textarea", rows: 3 },
];

export const certificationFields = [
  { key: "title", label: "Certificate name", required: true },
  { key: "issuer", label: "Issued by" },
];

export const achievementFields = [
  { key: "title", label: "Title", required: true },
  { key: "description", label: "Description", type: "textarea", rows: 3 },
];

export const heroFields = [
  { key: "name", label: "Full name", required: true },
  { key: "tagline", label: "Tagline", hint: "Shown above your name." },
  { key: "motto", label: "Motto", hint: "Shown in script above your photo." },
  { key: "headlineFirst", label: "Headline, first part" },
  { key: "headlineSecond", label: "Headline, second part", hint: "Shown in blue after the first part." },
  { key: "intro", label: "Short introduction", type: "textarea", rows: 3 },
  { key: "location", label: "Location" },
  {
    key: "photoUrl",
    label: "Profile photo",
    type: "file",
    accept: "image/png,image/jpeg,image/webp",
    buttonLabel: "Upload photo",
    hint: "Shown faintly behind the About section.",
    upload: (file) => uploadFile("photo", file),
  },
  {
    key: "resumeUrl",
    label: "Resume (PDF)",
    type: "file",
    accept: "application/pdf",
    buttonLabel: "Upload resume",
    deleteLabel: "Delete resume",
    upload: (file) => uploadFile("resume", file),
  },
];

export const aboutFields = [
  { key: "about", label: "About paragraphs", type: "paragraphs", rows: 10, hint: "Leave a blank line between paragraphs." },
];

export const contactFields = [
  { key: "email", label: "Email address", required: true },
  { key: "linkedin", label: "LinkedIn link" },
  { key: "github", label: "GitHub link" },
  { key: "location", label: "Location" },
];
