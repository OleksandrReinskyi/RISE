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