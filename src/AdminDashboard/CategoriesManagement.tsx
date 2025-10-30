import React, { useEffect, useState } from "react";

interface Category {
  id?: string;
  name: string;
  priceCents: number;
}

interface CategoriesManagementProps {
  token: string;
}

export default function CategoriesManagement({ token }: CategoriesManagementProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Category | null>(null);

  // Загрузка категорий
  const fetchCategories = async () => {
    if (!token) return;
    try {
      const res = await fetch(`http://91.142.94.183:8080/seat-categories?page=0&size=20`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCategories(data.data || []);
    } catch (err) {
      console.error("Ошибка загрузки категорий:", err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [token]);

  // Создание / редактирование категории
  const handleSave = async (cat: Category) => {
    if (!token) return;
    if (!cat.name.trim()) return alert("Введите название категории");
    if (cat.priceCents <= 0) return alert("Цена должна быть больше 0");

    try {
      const method = cat.id ? "PUT" : "POST";
      const url = cat.id
        ? `http://91.142.94.183:8080/seat-categories/${cat.id}`
        : `http://91.142.94.183:8080/seat-categories`;

      await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(cat),
      });

      await fetchCategories();
      setEditing(null);
    } catch (err) {
      console.error(err);
      alert("Не удалось сохранить категорию");
    }
  };


  const handleDelete = async (id: string) => {
    if (!token || !window.confirm("Удалить эту категорию?")) return;

    try {
      await fetch(`http://91.142.94.183:8080/seat-categories/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(categories.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
      alert("Не удалось удалить категорию");
    }
  };

  return (
    <div className="container mt-3">
      <h2 className="mb-3">🏷 Управление категориями мест</h2>

      <button
        className="btn btn-primary mb-3"
        onClick={() => setEditing({ name: "", priceCents: 0 })}
      >
        ➕ Добавить категорию
      </button>

      {editing && (
        <CategoryForm
          category={editing}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
        />
      )}

      <ul className="list-group">
        {categories.map((c) => (
          <li
            key={c.id}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            <span>
              <strong>{c.name}</strong> — {c.priceCents}₽
            </span>
            <span>
              <button
                className="btn btn-sm btn-warning me-2"
                onClick={() => setEditing(c)}
              >
                ✏️ Редактировать
              </button>
              <button
                className="btn btn-sm btn-danger"
                onClick={() => handleDelete(c.id!)}
              >
                🗑 Удалить
              </button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface CategoryFormProps {
  category: Category;
  onSave: (cat: Category) => void;
  onCancel: () => void;
}

function CategoryForm({ category, onSave, onCancel }: CategoryFormProps) {
  const [form, setForm] = useState(category);

  useEffect(() => {
    setForm(category);
  }, [category]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === "priceCents" ? Number(value) * 100 : value });
  };

  return (
    <div className="card p-3 mb-3">
      <h5>{category.id ? "Редактирование категории" : "Новая категория"}</h5>

      <input
        className="form-control mb-2"
        name="name"
        placeholder="Название категории"
        value={form.name}
        onChange={handleChange}
      />

      <input
        className="form-control mb-3"
        name="priceCents"
        type="number"
        placeholder="Цена (₽)"
        value={form.priceCents }
        onChange={handleChange}
      />

      <div className="d-flex justify-content-end">
        <button className="btn btn-success me-2" onClick={() => onSave(form)}>
          💾 Сохранить
        </button>
        <button className="btn btn-secondary" onClick={onCancel}>
          ✖ Отмена
        </button>
      </div>
    </div>
  );
}
