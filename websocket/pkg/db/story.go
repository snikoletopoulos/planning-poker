package db

import (
	"log"
)

type Vote struct {
	MemberID  string `json:"memberId"`
	StoryID   string `json:"storyId"`
	Vote      *int   `json:"vote"`
	CreatedAt string `json:"createdAt"`
}

func GetStoryVotes(storyID string) ([]Vote, error) {
	rows, err := DB.Query("SELECT story_id, member_id, vote, created_at FROM votes WHERE story_id = ?", storyID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var votes []Vote
	for rows.Next() {
		var vote Vote
		err := rows.Scan(&vote.StoryID, &vote.MemberID, &vote.Vote, &vote.CreatedAt)
		if err != nil {
			log.Fatal("Error scanning story votes:", err)
			return nil, err
		}
		votes = append(votes, vote)
	}

	return votes, nil
}
