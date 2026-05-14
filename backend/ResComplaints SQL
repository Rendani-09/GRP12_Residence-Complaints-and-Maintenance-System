-- ResComplaints SQL --

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = ON;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Schema --

CREATE TABLE IF NOT EXISTS public.role (
    role_id   INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    role_name VARCHAR(20) NOT NULL UNIQUE,
    CONSTRAINT role_name_chk CHECK (role_name IN ('Admin', 'Student'))
);

CREATE TABLE IF NOT EXISTS public.block (
    block_id   INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    block_num  INTEGER      NOT NULL UNIQUE,
    block_name VARCHAR(20)  NOT NULL UNIQUE,
    block_type VARCHAR(20)  NOT NULL,
    CONSTRAINT block_block_num_check CHECK (block_num BETWEEN 1 AND 23),
    CONSTRAINT block_type_chk        CHECK (block_type IN ('Residential', 'Facility'))
);

CREATE TABLE IF NOT EXISTS public.room (
    room_id     INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    block_id    INTEGER NOT NULL REFERENCES public.block (block_id),
    room_number INTEGER NOT NULL,
    CONSTRAINT room_room_number_check  CHECK (room_number BETWEEN 1 AND 10),
    CONSTRAINT room_block_room_unique  UNIQUE (block_id, room_number),
    CONSTRAINT room_id_block_unique    UNIQUE (room_id, block_id)
);

CREATE TABLE IF NOT EXISTS public.facility (
    facility_id   INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    block_id      INTEGER     NOT NULL REFERENCES public.block (block_id),
    facility_name VARCHAR(50) NOT NULL,
    facility_type VARCHAR(20) NOT NULL,
    CONSTRAINT facility_type_chk        CHECK (facility_type IN ('Kitchen', 'Toilet', 'Shower', 'Laundry')),
    CONSTRAINT facility_block_name_unique UNIQUE (block_id, facility_name),
    CONSTRAINT facility_id_block_unique   UNIQUE (facility_id, block_id)
);

CREATE TABLE IF NOT EXISTS public.complaint_category (
    category_id   INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    category_name VARCHAR(20) NOT NULL UNIQUE,
    CONSTRAINT complaint_category_name_chk
        CHECK (category_name IN ('Plumbing', 'Electrical', 'Structural', 'Hygiene'))
);

CREATE TABLE IF NOT EXISTS public.contractor (
    contractor_id   UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
    contractor_name VARCHAR(100) NOT NULL,
    specialization  VARCHAR(20)  NOT NULL,
    phone           VARCHAR(20),
    email           VARCHAR(100) UNIQUE,
    CONSTRAINT contractor_specialization_chk
        CHECK (specialization IN ('Plumbing', 'Electrical', 'Structural', 'Hygiene'))
);

CREATE TABLE IF NOT EXISTS public.users (
    user_id       UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name    VARCHAR(50)  NOT NULL,
    surname       VARCHAR(50)  NOT NULL,
    email         VARCHAR(100) NOT NULL UNIQUE,
    password_hash TEXT         NOT NULL,
    user_number   VARCHAR(8)   NOT NULL UNIQUE,
    block_id      INTEGER      REFERENCES public.block (block_id),
    room_id       INTEGER,
    role_id       INTEGER      NOT NULL REFERENCES public.role (role_id),
    CONSTRAINT users_email_domain_chk  CHECK (lower(email) LIKE '%@mynwu.ac.za'),
    CONSTRAINT users_user_number_chk   CHECK (user_number ~ '^[0-9]{8}$'),
    CONSTRAINT users_room_block_fkey   FOREIGN KEY (room_id, block_id)
                                           REFERENCES public.room (room_id, block_id)
);

CREATE TABLE IF NOT EXISTS public.complaint (
    complaint_id   UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
    submitted_by   UUID         NOT NULL REFERENCES public.users (user_id),
    category_id    INTEGER      NOT NULL REFERENCES public.complaint_category (category_id),
    block_id       INTEGER      NOT NULL REFERENCES public.block (block_id),
    room_id        INTEGER,
    facility_id    INTEGER,
    title          VARCHAR(100) NOT NULL,
    description    TEXT         NOT NULL,
    priority       VARCHAR(10)  NOT NULL DEFAULT 'Medium',
    status         VARCHAR(10)  NOT NULL DEFAULT 'Pending',
    date_submitted TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    admin_note     TEXT,
    CONSTRAINT complaint_location_chk
        CHECK (
            (room_id IS NOT NULL AND facility_id IS NULL) OR
            (room_id IS NULL     AND facility_id IS NOT NULL)
        ),
    CONSTRAINT complaint_priority_chk
        CHECK (priority IN ('Low', 'Medium', 'High')),
    CONSTRAINT complaint_status_chk
        CHECK (status  IN ('Pending', 'Assigned', 'Completed')),
    CONSTRAINT complaint_room_block_fkey
        FOREIGN KEY (room_id, block_id)     REFERENCES public.room     (room_id, block_id),
    CONSTRAINT complaint_facility_block_fkey
        FOREIGN KEY (facility_id, block_id) REFERENCES public.facility (facility_id, block_id)
);

CREATE TABLE IF NOT EXISTS public.assignment (
    assignment_id UUID      DEFAULT gen_random_uuid() PRIMARY KEY,
    complaint_id  UUID      NOT NULL UNIQUE REFERENCES public.complaint   (complaint_id),
    contractor_id UUID      NOT NULL        REFERENCES public.contractor  (contractor_id),
    assigned_by   UUID      NOT NULL        REFERENCES public.users       (user_id),
    date_assigned TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_completed TIMESTAMP,
    CONSTRAINT assignment_dates_chk
        CHECK (date_completed IS NULL OR date_completed >= date_assigned)
);

CREATE INDEX IF NOT EXISTS idx_complaint_submitted_by  ON public.complaint  (submitted_by);
CREATE INDEX IF NOT EXISTS idx_complaint_category_id   ON public.complaint  (category_id);
CREATE INDEX IF NOT EXISTS idx_complaint_block_id      ON public.complaint  (block_id);
CREATE INDEX IF NOT EXISTS idx_complaint_status        ON public.complaint  (status);
CREATE INDEX IF NOT EXISTS idx_complaint_priority      ON public.complaint  (priority);
CREATE INDEX IF NOT EXISTS idx_assignment_contractor_id ON public.assignment (contractor_id);
CREATE INDEX IF NOT EXISTS idx_facility_block_id ON public.facility (block_id);
CREATE INDEX IF NOT EXISTS idx_room_block_id     ON public.room     (block_id);
CREATE INDEX IF NOT EXISTS idx_users_block_id    ON public.users    (block_id);
CREATE INDEX IF NOT EXISTS idx_users_role_id     ON public.users    (role_id);

-- Views and Triggers --
CREATE OR REPLACE VIEW public.view_students AS
SELECT
    u.user_id,
    (u.first_name || ' ' || u.surname) AS full_name,
    u.email,
    u.user_number,
    b.block_name,
    r.room_number
FROM       public.users u
JOIN       public.block b  ON u.block_id = b.block_id
JOIN       public.room  r  ON u.room_id  = r.room_id
JOIN       public.role  ro ON u.role_id  = ro.role_id
WHERE      ro.role_name = 'Student';

CREATE OR REPLACE VIEW public.view_pending_complaints AS
SELECT
    c.complaint_id,
    c.title,
    c.description,
    c.priority,
    c.status,
    c.date_submitted,
    u.email AS submitted_by_email,
    b.block_name,
    r.room_number,
    f.facility_name
FROM public.complaint c
JOIN public.users u ON c.submitted_by = u.user_id
JOIN public.block b ON c.block_id = b.block_id
LEFT JOIN public.room r ON c.room_id = r.room_id
LEFT JOIN public.facility f ON c.facility_id = f.facility_id
WHERE c.status = 'Pending';

CREATE OR REPLACE FUNCTION public.enforce_user_role_rules()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE v_role_name VARCHAR(20);
BEGIN
    SELECT role_name INTO v_role_name FROM public.role WHERE role_id = NEW.role_id;
    IF v_role_name = 'Admin' THEN
        IF NEW.block_id IS NOT NULL OR NEW.room_id IS NOT NULL THEN
            RAISE EXCEPTION 'Admin users must not have block_id or room_id';
        END IF;
    ELSIF v_role_name = 'Student' THEN
        IF NEW.block_id IS NULL OR NEW.room_id IS NULL THEN
            RAISE EXCEPTION 'Student users must have both block_id and room_id';
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_enforce_user_role_rules
BEFORE INSERT OR UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION public.enforce_user_role_rules();

CREATE OR REPLACE FUNCTION public.sync_complaint_status()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.date_completed IS NOT NULL THEN
        UPDATE public.complaint SET status = 'Completed' WHERE complaint_id = NEW.complaint_id;
    ELSE
        UPDATE public.complaint SET status = 'Assigned' WHERE complaint_id = NEW.complaint_id;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_sync_complaint_status
AFTER INSERT OR UPDATE OF date_completed ON public.assignment
FOR EACH ROW EXECUTE FUNCTION public.sync_complaint_status();

-- Data --

INSERT INTO public.role (role_name) VALUES ('Admin') ON CONFLICT DO NOTHING;
INSERT INTO public.role (role_name) VALUES ('Student') ON CONFLICT DO NOTHING;

INSERT INTO public.block (block_num, block_name, block_type)
VALUES
(1,'Block 1','Residential'),(2,'Block 2','Residential'),(3,'Block 3','Residential'),
(4,'Block 4','Residential'),(5,'Block 5','Residential'),(6,'Block 6','Residential'),
(7,'Block 7','Residential'),(8,'Block 8','Residential'),(9,'Block 9','Residential'),
(10,'Block 10','Residential'),(11,'Block 11','Residential'),(12,'Block 12','Residential'),
(13,'Block 13','Residential'),(14,'Block 14','Residential'),(15,'Block 15','Residential'),
(16,'Block 16','Residential'),(17,'Block 17','Residential'),(18,'Block 18','Residential'),
(19,'Block 19','Residential'),(20,'Block 20','Residential'),(21,'Block 21','Residential'),
(22,'Block 22','Residential'),(23,'Block 23','Facility')
ON CONFLICT DO NOTHING;

INSERT INTO public.room (block_id, room_number)
SELECT b.block_id, gs.room_number
FROM public.block b
CROSS JOIN generate_series(1,10) AS gs(room_number)
WHERE b.block_num BETWEEN 1 AND 22
ON CONFLICT DO NOTHING;

INSERT INTO public.facility (block_id, facility_name, facility_type)
SELECT b.block_id, (f.facility_type || ' Block ' || b.block_num) AS facility_name, f.facility_type
FROM public.block b
CROSS JOIN (VALUES ('Kitchen'),('Toilet'),('Shower')) AS f(facility_type)
WHERE b.block_num BETWEEN 1 AND 22
ON CONFLICT DO NOTHING;

INSERT INTO public.facility (block_id, facility_name, facility_type)
SELECT block_id, ('Laundry Block ' || block_num) AS facility_name, 'Laundry'
FROM public.block WHERE block_num = 23
ON CONFLICT DO NOTHING;

INSERT INTO public.complaint_category (category_name) VALUES
('Plumbing'),('Electrical'),('Structural'),('Hygiene')
ON CONFLICT DO NOTHING;

INSERT INTO public.contractor (contractor_id, contractor_name, specialization, phone, email)
VALUES
(gen_random_uuid(), 'John Plumber','Plumbing','0761234567','john.plumber@contractors.co.za'),
(gen_random_uuid(), 'Jane Plumber','Plumbing','0762234567','jane.plumber@contractors.co.za'),
(gen_random_uuid(), 'Mike Electrician','Electrical','0763234567','mike.elec@contractors.co.za'),
(gen_random_uuid(), 'Sarah Electrician','Electrical','0764234567','sarah.elec@contractors.co.za'),
(gen_random_uuid(), 'Tom Structural','Structural','0765234567','tom.struct@contractors.co.za'),
(gen_random_uuid(), 'Lisa Structural','Structural','0766234567','lisa.struct@contractors.co.za'),
(gen_random_uuid(), 'David Hygiene','Hygiene','0767234567','david.hygiene@contractors.co.za'),
(gen_random_uuid(), 'Emma Hygiene','Hygiene','0768234567','emma.hygiene@contractors.co.za')
ON CONFLICT DO NOTHING;

INSERT INTO public.users (first_name, surname, email, password_hash, user_number, block_id, room_id, role_id)
VALUES
('Admin','User1','12345601@mynwu.ac.za','$2b$10$TQh/Fxd5CcX5AoF6nEx6SuZ8lYHOE9SSFGLWSfXZjOHDmqr2/QnxG','12345601',NULL,NULL,(SELECT role_id FROM public.role WHERE role_name='Admin')),
('Admin','User2','12345602@mynwu.ac.za','$2b$10$rVycBS/GPqomCKxLtzqCUOGFoB4p.FIvUWp6Ot4VxGUwxlYl2XhGa','12345602',NULL,NULL,(SELECT role_id FROM public.role WHERE role_name='Admin')),
('Admin','Manager','12345603@mynwu.ac.za','$2b$10$Fb1a1RHW8o1l.lJIV2nrJeLDxd/UzfXYsKx2mLtK19kIHuFGMGkyi','12345603',NULL,NULL,(SELECT role_id FROM public.role WHERE role_name='Admin'))
ON CONFLICT DO NOTHING;

INSERT INTO public.users (first_name, surname, email, password_hash, user_number, block_id, room_id, role_id)
VALUES
('Alice','Johnson','20240101@mynwu.ac.za','$2b$10$hhvrjqxKX5tPX.WymY5KluUxtYgnfGcRskfX6P/Qo0F/zZLXQDu9.','20240101',
    (SELECT block_id FROM public.block WHERE block_num=1),
    (SELECT room_id FROM public.room WHERE block_id=(SELECT block_id FROM public.block WHERE block_num=1) AND room_number=1),
    (SELECT role_id FROM public.role WHERE role_name='Student')),
('Bob','Smith','20240102@mynwu.ac.za','$2b$10$Vxgcx.ZLX8L20WSTS11wgeA9DC/WjPwOs.MjF5upcXPJHlZ4eo1SW','20240102',
    (SELECT block_id FROM public.block WHERE block_num=1),
    (SELECT room_id FROM public.room WHERE block_id=(SELECT block_id FROM public.block WHERE block_num=1) AND room_number=2),
    (SELECT role_id FROM public.role WHERE role_name='Student')),
('Charlie','Brown','20240103@mynwu.ac.za','$2b$10$6fSMbwBJtf3/JH.TMYY6B.wV/fyR4MgMANP6E53GDjBNzcc3iNniK','20240103',
    (SELECT block_id FROM public.block WHERE block_num=2),
    (SELECT room_id FROM public.room WHERE block_id=(SELECT block_id FROM public.block WHERE block_num=2) AND room_number=3),
    (SELECT role_id FROM public.role WHERE role_name='Student'))
ON CONFLICT DO NOTHING;

INSERT INTO public.complaint (submitted_by, category_id, block_id, room_id, facility_id, title, description, priority, status)
VALUES
((SELECT user_id FROM public.users WHERE email='20240101@mynwu.ac.za'),
 (SELECT category_id FROM public.complaint_category WHERE category_name='Electrical'),
 (SELECT block_id FROM public.block WHERE block_num=1),
 (SELECT room_id FROM public.room WHERE block_id=(SELECT block_id FROM public.block WHERE block_num=1) AND room_number=1),
 NULL,'Faulty ceiling light','The ceiling light in room 1 is flickering.', 'High','Pending'),

((SELECT user_id FROM public.users WHERE email='20240102@mynwu.ac.za'),
 (SELECT category_id FROM public.complaint_category WHERE category_name='Hygiene'),
 (SELECT block_id FROM public.block WHERE block_num=1),
 NULL,
 (SELECT facility_id FROM public.facility WHERE block_id=(SELECT block_id FROM public.block WHERE block_num=1) AND facility_type='Shower'),
 'Blocked shower drain','Shower drain is blocked and water collects.', 'Medium','Pending'),

((SELECT user_id FROM public.users WHERE email='20240103@mynwu.ac.za'),
 (SELECT category_id FROM public.complaint_category WHERE category_name='Structural'),
 (SELECT block_id FROM public.block WHERE block_num=2),
 (SELECT room_id FROM public.room WHERE block_id=(SELECT block_id FROM public.block WHERE block_num=2) AND room_number=3),
 NULL,'Cracked wall','A crack has appeared near the window.','Medium','Pending')
ON CONFLICT DO NOTHING;

INSERT INTO public.assignment (assignment_id, complaint_id, contractor_id, assigned_by, date_assigned, date_completed)
VALUES
(gen_random_uuid(), (SELECT complaint_id FROM public.complaint WHERE title='Faulty ceiling light'),
    (SELECT contractor_id FROM public.contractor WHERE email='mike.elec@contractors.co.za'),
    (SELECT user_id FROM public.users WHERE email='12345601@mynwu.ac.za'), NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day'),

(gen_random_uuid(), (SELECT complaint_id FROM public.complaint WHERE title='Blocked shower drain'),
    (SELECT contractor_id FROM public.contractor WHERE specialization='Hygiene' LIMIT 1),
    (SELECT user_id FROM public.users WHERE email='12345602@mynwu.ac.za'), NOW() - INTERVAL '1 day', NULL)
ON CONFLICT DO NOTHING;

-- Queries--
-- Contractors by specialization
SELECT c.specialization,
       COUNT(*) AS contractor_count
FROM public.contractor c
GROUP BY c.specialization
ORDER BY contractor_count DESC;

-- Recent pending complaints
SELECT complaint_id, title, status, date_submitted
FROM public.complaint
WHERE status = 'Pending'
ORDER BY date_submitted DESC
LIMIT 5;

-- Complaints mentioning leaks in Block 2
SELECT c.complaint_id, c.title, c.description
FROM public.complaint c
JOIN public.block b ON c.block_id = b.block_id
WHERE (c.description ILIKE '%leak%' OR c.description ILIKE '%leaking%')
    AND b.block_num = 2;

WITH params AS (SELECT 1 AS sample_block)
SELECT u.user_number,
       UPPER(u.surname) AS surname_upper,
       CONCAT(u.first_name, ' ', u.surname) AS full_name
FROM public.users u
CROSS JOIN params
WHERE u.block_id = (SELECT block_id FROM public.block WHERE block_num = params.sample_block);

-- Complaint share by block
WITH totals AS (
    SELECT block_id, COUNT(*) AS cnt
    FROM public.complaint
    GROUP BY block_id
), grand AS (
    SELECT SUM(cnt)::numeric AS total FROM totals
)
SELECT b.block_num,
       t.cnt,
       ROUND((t.cnt::numeric / g.total) * 100, 2) AS pct_of_all_complaints
FROM totals t
JOIN public.block b ON t.block_id = b.block_id
CROSS JOIN grand g
ORDER BY t.cnt DESC;

-- Complaints from the last 7 days
SELECT complaint_id, title, date_submitted,
       (CURRENT_DATE - date(date_submitted)) AS days_old
FROM public.complaint
WHERE date_submitted >= CURRENT_DATE - INTERVAL '7 days';

-- Average complaints per block
SELECT AVG(cnt) AS avg_complaints_per_block
FROM (
    SELECT block_id, COUNT(*) AS cnt
    FROM public.complaint
    GROUP BY block_id
) sub;

-- Blocks with more than one complaint
SELECT b.block_num, COUNT(*) AS complaints
FROM public.complaint c
JOIN public.block b ON c.block_id = b.block_id
GROUP BY b.block_num
HAVING COUNT(*) > 1;

-- Complaint details with assigned contractor
SELECT c.complaint_id, c.title, u.email AS submitted_by, b.block_name,
       r.room_number, f.facility_name, a.date_assigned, ctr.contractor_name
FROM public.complaint c
JOIN public.users u ON c.submitted_by = u.user_id
JOIN public.block b ON c.block_id = b.block_id
LEFT JOIN public.room r ON c.room_id = r.room_id
LEFT JOIN public.facility f ON c.facility_id = f.facility_id
LEFT JOIN public.assignment a ON a.complaint_id = c.complaint_id
LEFT JOIN public.contractor ctr ON a.contractor_id = ctr.contractor_id;

-- Users with above-average complaint counts
SELECT u.user_id, u.email, COUNT(c.complaint_id) AS user_complaints
FROM public.users u
JOIN public.complaint c ON u.user_id = c.submitted_by
GROUP BY u.user_id, u.email
HAVING COUNT(c.complaint_id) > (
    SELECT AVG(user_cnt) FROM (
        SELECT COUNT(*) AS user_cnt FROM public.complaint GROUP BY submitted_by
    ) x
);

-- Complaints by priority and date
SELECT complaint_id, title, priority, date_submitted
FROM public.complaint
ORDER BY CASE priority WHEN 'High' THEN 1 WHEN 'Medium' THEN 2 ELSE 3 END, date_submitted DESC;

-- Contractors with plumb in the name
SELECT contractor_id, contractor_name, specialization
FROM public.contractor
WHERE LOWER(contractor_name) LIKE '%plumb%';

-- Complaint summary
SELECT complaint_id, title, status FROM public.complaint LIMIT 10;

-- Contractors who handled complaints in the last 30 days
SELECT DISTINCT ctr.contractor_id, ctr.contractor_name
FROM public.contractor ctr
JOIN public.assignment a ON a.contractor_id = ctr.contractor_id
JOIN public.complaint c ON a.complaint_id = c.complaint_id
WHERE a.date_assigned >= CURRENT_DATE - INTERVAL '30 days';

-- Average resolution time in days
SELECT ROUND(AVG(EXTRACT(EPOCH FROM (a.date_completed - a.date_assigned)) / 86400.0)::numeric, 2) AS avg_resolution_days
FROM public.assignment a
WHERE a.date_completed IS NOT NULL;
