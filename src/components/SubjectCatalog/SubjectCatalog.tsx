"use client";

import React, { useMemo, useState } from "react";
import { SUBJECTS_DATA } from "../../constants";
import type { Course } from "../../types";

const CATEGORY_ORDER = [
  "Đại cương",
  "Cơ sở ngành (CSN)",
  "Chuyên ngành (CN/CNTC)",
  "Khác (Tự chọn/CĐTN/TN)",
];

const normalize = (str: string) =>
  str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .trim();

const formatWeight = (w: number) => `${Math.round(w * 100)}%`;

const SubjectCatalog: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(CATEGORY_ORDER),
  );

  const groups = useMemo(() => {
    const term = normalize(searchTerm);
    return CATEGORY_ORDER.map((category) => {
      const all = (SUBJECTS_DATA[category] || []) as Course[];
      const filtered = term
        ? all.filter(
            (c) =>
              normalize(c.courseCode).includes(term) ||
              normalize(c.courseNameVi).includes(term) ||
              normalize(c.courseNameEn).includes(term),
          )
        : all;
      return { category, subjects: filtered, totalInCategory: all.length };
    }).filter((g) => g.subjects.length > 0 || !searchTerm.trim());
  }, [searchTerm]);

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  return (
    <div className="instructions-container">
      <h1>Danh mục môn học</h1>
      <div className="dropdown-search-container" style={{ marginBottom: 20 }}>
        <div className="search-input-wrapper">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            className="search-icon"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Tìm theo mã môn hoặc tên môn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="dropdown-input"
            aria-label="Tìm kiếm môn học"
          />
        </div>
      </div>

      {groups.map(({ category, subjects, totalInCategory }) => {
        const isExpanded = expandedCategories.has(category) || !!searchTerm.trim();
        return (
          <div key={category} className="instruction-item" style={{ padding: 0, overflow: "hidden" }}>
            <button
              type="button"
              onClick={() => toggleCategory(category)}
              className="category-header"
              aria-expanded={isExpanded}
              style={{
                width: "100%",
                textAlign: "left",
                background: "transparent",
                border: "none",
                borderRadius: 0,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              <span className="category-title">
                {category} ({totalInCategory} môn)
              </span>
              <span className="category-arrow">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s ease",
                  }}
                  aria-hidden="true"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </span>
            </button>

            {isExpanded && (
              <div className="table-wrapper" style={{ padding: "0 16px 16px" }}>
                {subjects.length === 0 ? (
                  <p style={{ padding: "12px 0", color: "var(--text-color)", opacity: 0.7 }}>
                    Không tìm thấy môn nào phù hợp trong nhóm này.
                  </p>
                ) : (
                  <table className="grade-table" style={{ width: "100%" }}>
                    <thead>
                      <tr>
                        <th>Mã môn</th>
                        <th>Tên môn (VI)</th>
                        <th>Tên môn (EN)</th>
                        <th>Tín chỉ</th>
                        <th>Quá trình</th>
                        <th>Giữa kỳ</th>
                        <th>Thực hành</th>
                        <th>Cuối kỳ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subjects.map((c) => (
                        <tr key={c.courseCode}>
                          <td>
                            <span className="subject-code">{c.courseCode}</span>
                          </td>
                          <td>{c.courseNameVi}</td>
                          <td>{c.courseNameEn}</td>
                          <td style={{ textAlign: "center" }}>{c.credits}</td>
                          <td style={{ textAlign: "center" }}>
                            {formatWeight(c.defaultWeights.progressWeight)}
                          </td>
                          <td style={{ textAlign: "center" }}>
                            {formatWeight(c.defaultWeights.midtermWeight)}
                          </td>
                          <td style={{ textAlign: "center" }}>
                            {formatWeight(c.defaultWeights.practiceWeight)}
                          </td>
                          <td style={{ textAlign: "center" }}>
                            {formatWeight(c.defaultWeights.finalTermWeight)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SubjectCatalog;