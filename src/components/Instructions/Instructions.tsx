import React from "react";

const Instructions: React.FC = () => {
  return (
    <div className="instructions-container">
      <h1>Hướng dẫn sử dụng</h1>
      
      <section>
        <h2>1. Cách tính điểm trung bình (GPA)</h2>
        <div className="instruction-item">
          <h3>Điểm học phần (Môn học)</h3>
          <p>
            Điểm học phần được tính bằng tổng điểm các thành phần nhân với trọng số tương ứng:
          </p>
          <code>
            Điểm HP = (QT × wQT) + (GK × wGK) + (TH × wTH) + (CK × wCK)
          </code>
          <p>Trong đó:</p>
          <ul>
            <li><strong>QT, GK, TH, CK</strong>: Điểm Quá trình, Giữa kỳ, Thực hành, Cuối kỳ.</li>
            <li><strong>w</strong>: Trọng số của từng cột điểm (Tổng trọng số phải bằng 100%).</li>
          </ul>
        </div>

        <div className="instruction-item">
          <h3>Điểm trung bình học kỳ / Toàn khóa</h3>
          <p>Sử dụng công thức tính điểm trung bình có trọng số theo số tín chỉ:</p>
          <code>
            ĐTB = Σ(Điểm HP × Số tín chỉ) / Σ(Tổng số tín chỉ)
          </code>
        </div>
      </section>

      <section>
        <h2>2. Điểm kỳ vọng (Expected Score)</h2>
        <div className="instruction-item">
          <h3>Cách thức hoạt động</h3>
          <p>
            Khi bạn nhập một con số vào cột <strong>"Điểm kỳ vọng"</strong>, hệ thống sẽ tự động tính toán số điểm 
            tối thiểu bạn cần đạt được ở các cột điểm <em>chưa có kết quả</em> để đạt được mục tiêu đó.
          </p>
          <p>Công thức tính điểm thành phần cần thiết:</p>
          <code>
            Điểm cần đạt = (Điểm kỳ vọng - Điểm đã có) / Trọng số còn lại
          </code>
          <p>
            <em>Lưu ý:</em> Nếu điểm cần đạt vượt quá 10.0, hệ thống sẽ hiển thị chữ màu đỏ để cảnh báo mục tiêu có thể không khả thi.
          </p>
        </div>
      </section>

      <section>
        <h2>3. Cơ chế tự động tính toán lại (Rebalancing)</h2>
        <p>Hệ thống hỗ trợ tính toán bắc cầu từ cấp độ cao nhất xuống thấp nhất:</p>
        <div className="instruction-item">
          <ul>
            <li>
              <strong>Kỳ vọng chung:</strong> Khi nhập mục tiêu GPA toàn khóa, hệ thống sẽ phân bổ điểm cần đạt cho tất cả các học kỳ chưa hoàn thành.
            </li>
            <li>
              <strong>Kỳ vọng học kỳ:</strong> Khi nhập mục tiêu GPA học kỳ, hệ thống sẽ phân bổ điểm cho các môn học trong kỳ đó dựa trên số tín chỉ.
            </li>
            <li>
              <strong>Thứ tự ưu tiên:</strong> Nếu bạn nhập thủ công điểm kỳ vọng cho một môn, môn đó sẽ được "khóa" và hệ thống sẽ điều chỉnh điểm các môn còn lại để vẫn đảm bảo mục tiêu chung của học kỳ.
            </li>
          </ul>
        </div>
      </section>

      <section>
        <h2>4. Quy định & Hướng dẫn nhập liệu</h2>
        <div className="instruction-item">
          <ul>
            <li><strong>Tìm kiếm môn:</strong> Click vào cột "Mã HP" hoặc "Tên HP" để tìm kiếm môn học có sẵn trong dữ liệu UIT (tự động điền tín chỉ và trọng số mặc định).</li>
            <li><strong>Dữ liệu:</strong> Mọi thông tin bạn nhập được lưu tự động vào trình duyệt (Local Storage) và sẽ không mất đi khi bạn tải lại trang.</li>
            <li>
              <strong>Tùy chỉnh:</strong> Bạn có thể click vào nút 3 chấm 
              <span className="three-dots">⋮</span> 
              để chỉnh sửa trọng số % hoặc xóa môn học/học kỳ.
            </li>
            <li>
              <strong>Khôi phục mặc định:</strong> Bạn có thể nhấn vào dòng chữ <em>"Khôi phục mặc định"</em>. 
              Hệ thống sẽ dựa vào Mã HP để lấy lại bộ trọng số (QT, GK, TH, CK) chuẩn từ cơ sở dữ liệu của nhà trường nếu bạn lỡ tay chỉnh sửa sai.
            </li>
          </ul>
        </div>
      </section>

      <section>
        <h2>5. Hướng dẫn nhập điểm từ file PDF</h2>
        <div className="instruction-item">
          <h3>Cách nhập điểm từ file PDF</h3>
          <ol>
            <li>Lấy file PDF từ hệ thống UIT:
              <ol type="a">
                <li>Truy cập <a href="https://student.uit.edu.vn/sinhvien/kqhoctap" target="_blank" rel="noopener noreferrer">https://student.uit.edu.vn/sinhvien/kqhoctap</a></li>
                <li>Nhấn vào nút <strong>"In Bảng Điểm"</strong></li>
                <li>Nhấn <kbd>CTRL + P</kbd>, chọn lưu dưới dạng PDF và bấm lưu</li>
              </ol>
            </li>
            <li>Trong ứng dụng này, nhấn vào nút <strong>"Nhập từ PDF"</strong> ở góc trên bên phải màn hình</li>
            <li>Chọn file PDF vừa tải về</li>
            <li>Chờ hệ thống xử lý và trích xuất dữ liệu</li>
            <li>Kiểm tra và xác nhận dữ liệu đã được nhập tự động</li>
          </ol>
          
          <h3>Lưu ý khi sử dụng tính năng nhập từ PDF</h3>
          <ul>
            <li>Chỉ hỗ trợ file PDF xuất từ hệ thống quản lý đào tạo của trường</li>
            <li>Đảm bảo file PDF không bị khóa hoặc bảo vệ bằng mật khẩu</li>
            <li>Hệ thống sẽ tự động nhận diện và điền các thông tin:
              <ul>
                <li>Mã học phần và tên học phần</li>
                <li>Số tín chỉ</li>
                <li>Điểm quá trình, giữa kỳ, thực hành, cuối kỳ (nếu có)</li>
                <li>Trọng số mặc định của từng môn học</li>
              </ul>
            </li>
            <li>Sau khi nhập, bạn có thể chỉnh sửa lại thông tin nếu cần thiết</li>
          </ul>
          
          <p className="note">
            <strong>Lưu ý quan trọng:</strong> Vui lòng kiểm tra kỹ dữ liệu sau khi nhập từ file PDF để đảm bảo tính chính xác.
          </p>
        </div>
      </section>

      <section>
        <h2>6. Xuất dữ liệu ra file Excel</h2>
        <div className="instruction-item">
          <h3>Cách xuất dữ liệu ra Excel</h3>
          <ol>
            <li>Đảm bảo bạn đã nhập đầy đủ dữ liệu điểm số</li>
            <li>Nhấn vào nút <strong>"Xuất Excel"</strong> ở góc trên bên phải màn hình</li>
            <li>Chọn vị trí lưu file trên máy tính của bạn</li>
            <li>Đặt tên file và nhấn <strong>Lưu</strong></li>
          </ol>
          
          <h3>Thông tin có trong file Excel</h3>
          <ul>
            <li>Toàn bộ thông tin môn học đã nhập</li>
            <li>Điểm các thành phần (quá trình, giữa kỳ, thực hành, cuối kỳ)</li>
            <li>Trọng số từng phần</li>
            <li>Điểm tổng kết môn học</li>
            <li>Điểm kỳ vọng (nếu có)</li>
          </ul>
          
          <p className="note">
            <strong>Lưu ý:</strong> File Excel có thể được mở bằng Microsoft Excel, Google Sheets hoặc các phần mềm tương thích khác.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Instructions;
