export let singleClassQuery = "SELECT id,_name,class,privileged FROM pupil WHERE class=?;"
export let classOrdersForDay = `SELECT ppl._name,
            CASE 
                WHEN ord.user_id IS NOT NULL THEN "Так"
                ELSE "Ні"
            END AS ordered
            FROM pupil AS ppl
            Left JOIN \`order\` AS ord
                ON ppl.id = ord.user_id
                AND ord._day = ? 
                AND ord._month = ? 
                AND ord._year = ?
                AND ord.user_type = ?
            WHERE ppl.class = ?;
            `;

export let pupilOrder = `SELECT * FROM \`order\` WHERE _day=? AND _month=? AND _year=? AND user_id = ? AND user_type = ?;
        `
export let menuOrder = `SELECT id,_name,price FROM menu WHERE _day = ? AND _month = ? AND _year = ?;`; 

export let ingridientsOrder = `SELECT _name, photo, _description FROM ingridient WHERE id IN (SELECT ingridient_id FROM menu_ingridients WHERE menu_id = ?); `;

export let classOrders = `SELECT ppl.id as user_id, _name, privileged,
        CASE 
            WHEN ord.user_id IS NOT NULL THEN true
            ELSE false
        END AS ordered
        FROM pupil AS ppl
        Left JOIN \`order\` AS ord
            ON ppl.id = ord.user_id
            AND ord._day = ? 
            AND ord._month = ? 
            AND ord._year = ?
            AND ord.user_type = ?
        WHERE ppl.class = ?;
        `


export let deleteOrder = `DELETE FROM \`order\` 
        WHERE user_id = ? AND user_type = ? 
        AND _day=? AND _month=? AND _year=?;`;

export let insertOrder = `INSERT INTO \`order\` (user_id,user_type,_day,_month,_year) 
        VALUES(?,?,?,?,?);`